use flate2::write::ZlibEncoder;
use flate2::Compression;
use grebi_shared::get_id;
use std::io::BufReader;
use std::io::BufRead;
use std::io::BufWriter;
use std::io::StdinLock;
use std::io;
use std::io::Write;

#[global_allocator]
static ALLOC: jemallocator::Jemalloc = jemallocator::Jemalloc;

fn main() {

    let stdin = io::stdin().lock();
    let mut reader = BufReader::new(stdin);

    let stdout = io::stdout().lock();
    let mut writer = BufWriter::new(stdout);

    let mut n:i64 = 0;

    let mut line:Vec<u8> = Vec::new();

    loop {

        line.clear();
        reader.read_until(b'\n', &mut line).unwrap();

        if line.len() == 0 {
            eprintln!("saw {} lines", n);
            break;
        }

        n = n + 1;

        let id = get_id(&line);

        writer.write_all(&(id.len() as u32).to_le_bytes()).unwrap();
        writer.write_all(id).unwrap();

        let mut enc = ZlibEncoder::new(Vec::new(), Compression::new(9));

        enc.write_all(&line).unwrap();
        let compressed = enc.finish().unwrap();

        writer.write_all(&(compressed.len() as u32).to_le_bytes()).unwrap();
        writer.write_all(&compressed).unwrap();
    }

}

