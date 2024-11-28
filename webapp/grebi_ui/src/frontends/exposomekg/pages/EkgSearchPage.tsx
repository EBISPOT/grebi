
import EkgHeader from "../EkgHeader";
import SearchInterface from "../../../components/SearchInterface";

export default function EkgSearchPage() {
  return (
    <div>
      <EkgHeader section="home" />
      <main className="container mx-auto px-4 h-fit my-8">
        <SearchInterface subgraph={process.env.REACT_APP_EXPOSOMEKG_SUBGRAPH!}/>
      </main>
    </div>
  );
}
