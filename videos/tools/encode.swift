// MP4 encoder and checker for the technical previews, using macOS AVFoundation
// (no ffmpeg needed).
//
//   encode <out.mp4> <fps> <width> <height>
//       reads frames from stdin, each as [4-byte big-endian length][JPEG bytes],
//       and writes an H.264 MP4 where frame n is shown at time n / fps.
//   encode --probe <file.mp4>
//       opens a finished file and prints its real duration, size and frame rate.
//
// render.mjs compiles this with `swiftc -O` and runs it for you.
import AVFoundation
import CoreGraphics
import Foundation
import ImageIO

func fail(_ message: String) -> Never {
    FileHandle.standardError.write((message + "\n").data(using: .utf8)!)
    exit(1)
}

func probe(_ path: String) async throws {
    let asset = AVURLAsset(url: URL(fileURLWithPath: path))
    let duration = try await asset.load(.duration)
    guard let track = try await asset.loadTracks(withMediaType: .video).first else { fail("no video track in \(path)") }
    let size = try await track.load(.naturalSize)
    let fps = try await track.load(.nominalFrameRate)
    let frames = try await track.load(.timeRange).duration.seconds * Double(fps)
    let bytes = (try FileManager.default.attributesOfItem(atPath: path)[.size] as? Int) ?? 0
    print(String(format: "probe %@: duration %.3f s (%d:%06.3f), %dx%d, %.2f fps, about %.0f frames, %.1f MB",
                 (path as NSString).lastPathComponent, duration.seconds, Int(duration.seconds) / 60,
                 duration.seconds.truncatingRemainder(dividingBy: 60), Int(size.width), Int(size.height),
                 fps, frames, Double(bytes) / 1_048_576))
}

func readExactly(_ count: Int) -> Data? {
    var data = Data()
    while data.count < count {
        let chunk = FileHandle.standardInput.readData(ofLength: count - data.count)
        if chunk.isEmpty { return data.isEmpty ? nil : data }
        data.append(chunk)
    }
    return data
}

func encode(out: String, fps: Int32, width: Int, height: Int) throws {
    let url = URL(fileURLWithPath: out)
    try? FileManager.default.removeItem(at: url)
    let writer = try AVAssetWriter(outputURL: url, fileType: .mp4)
    // Put the index at the start of the file so browsers can start playing before it fully loads.
    writer.shouldOptimizeForNetworkUse = true
    let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
        AVVideoCodecKey: AVVideoCodecType.h264,
        AVVideoWidthKey: width,
        AVVideoHeightKey: height,
        AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 6_000_000, AVVideoMaxKeyFrameIntervalKey: Int(fps) * 2],
    ])
    input.expectsMediaDataInRealTime = false
    let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
        kCVPixelBufferWidthKey as String: width,
        kCVPixelBufferHeightKey as String: height,
    ])
    writer.add(input)
    guard writer.startWriting() else { fail("cannot start writing: \(String(describing: writer.error))") }
    writer.startSession(atSourceTime: .zero)

    var n: Int64 = 0
    while let head = readExactly(4), head.count == 4 {
        let length = Int(head[head.startIndex]) << 24 | Int(head[head.startIndex + 1]) << 16 | Int(head[head.startIndex + 2]) << 8 | Int(head[head.startIndex + 3])
        guard let jpg = readExactly(length), jpg.count == length,
              let src = CGImageSourceCreateWithData(jpg as CFData, nil),
              let image = CGImageSourceCreateImageAtIndex(src, 0, nil) else { fail("bad frame \(n)") }
        while !input.isReadyForMoreMediaData { usleep(2000) }
        guard let pool = adaptor.pixelBufferPool else { fail("no pixel buffer pool") }
        var buffer: CVPixelBuffer?
        CVPixelBufferPoolCreatePixelBuffer(nil, pool, &buffer)
        guard let pb = buffer else { fail("no pixel buffer for frame \(n)") }
        CVPixelBufferLockBaseAddress(pb, [])
        let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb), width: width, height: height, bitsPerComponent: 8,
                            bytesPerRow: CVPixelBufferGetBytesPerRow(pb), space: CGColorSpaceCreateDeviceRGB(),
                            bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
        ctx.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
        CVPixelBufferUnlockBaseAddress(pb, [])
        // Frame n is shown at exactly n / fps seconds.
        if !adaptor.append(pb, withPresentationTime: CMTime(value: n, timescale: fps)) { fail("append failed at frame \(n): \(String(describing: writer.error))") }
        n += 1
    }
    input.markAsFinished()
    let done = DispatchSemaphore(value: 0)
    writer.finishWriting { done.signal() }
    done.wait()
    if writer.status != .completed { fail("writing failed: \(String(describing: writer.error))") }
    print("encoded \(n) frames to \(out)")
}

let args = CommandLine.arguments
if args.count == 3 && args[1] == "--probe" {
    let sem = DispatchSemaphore(value: 0)
    Task { do { try await probe(args[2]) } catch { fail("probe failed: \(error)") }; sem.signal() }
    sem.wait()
} else if args.count == 5, let fps = Int32(args[2]), let w = Int(args[3]), let h = Int(args[4]) {
    try encode(out: args[1], fps: fps, width: w, height: h)
    let sem = DispatchSemaphore(value: 0)
    Task { do { try await probe(args[1]) } catch { fail("probe failed: \(error)") }; sem.signal() }
    sem.wait()
} else {
    fail("usage: encode <out.mp4> <fps> <width> <height>  |  encode --probe <file.mp4>")
}
