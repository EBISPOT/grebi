use std::collections::HashMap;
use std::io::{BufWriter, self, BufReader, Write,BufRead};
use clap::Parser;
use serde_json;
use serde_json::Value;
use serde_json::json;

#[derive(clap::Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {

    #[arg(long)]
    datasource_name: String,

    #[arg(long)]
    filename: String,

    #[arg(long)]
    kgx_rename_field:Option<Vec<String>>,

    #[arg(long, default_value_t = String::from(""))]
    kgx_inject_key_prefix:String,
}

fn main() {

    let args = Args::parse();

    let stdin = io::stdin().lock();
    let mut reader = BufReader::new(stdin);

    let stdout = io::stdout().lock();
    let mut output_nodes = BufWriter::new(stdout);

    let mut renames:HashMap<String,String> = HashMap::new();

    if args.kgx_rename_field.is_some() {
        for arg in args.kgx_rename_field.unwrap() {
            let delim = arg.find(':').unwrap();
            let (column,rename)=(arg[0..delim].to_string(), arg[delim+1..].to_string());
            renames.insert(column.clone(), rename.clone());
        }
    }

    loop {

        let mut line:Vec<u8> = Vec::new();
        reader.read_until(b'\n', &mut line).unwrap();

        if line.len() == 0 {
            break;
        }

        let json:serde_json::Map<String,Value> = serde_json::from_slice(&line).unwrap();

        let subject = json.get("subject").unwrap().as_str().unwrap().to_string();
        let predicate = json.get("predicate").unwrap().as_str().unwrap().to_string();
        let object = json.get("object").unwrap().as_str().unwrap().to_string();

        let mut out_props = serde_json::Map::new();
        for (k,v) in json.iter() {
            if k.eq("subject") || k.eq("predicate") || k.eq("object") {
                continue;
            }
            let new_k = {
                let alias = renames.get(k);
                if alias.is_some() {
                    alias.unwrap().clone()
                } else {
                    if args.kgx_inject_key_prefix.len() > 0 && k.find(":").is_none() {
                        args.kgx_inject_key_prefix.clone() + k
                    } else {
                        k.clone()
                    }
                }
            };
            out_props.insert(new_k, v.clone());
        }

        let mut out_json = serde_json::Map::new();
        out_json.insert("id".to_string(), Value::String(subject));

        out_json.insert(predicate, json!({
            "grebi:value": object,
            "grebi:properties": out_props
        }));

        output_nodes.write_all(Value::Object(out_json).to_string().as_bytes()).unwrap();
        output_nodes.write_all("\n".as_bytes()).unwrap();
    }

    output_nodes.flush().unwrap();
}

