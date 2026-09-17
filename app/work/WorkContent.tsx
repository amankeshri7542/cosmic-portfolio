import EngineeringStudies from "@/components/EngineeringStudies";
import ProjectArchive from "@/components/ProjectArchive";
export default function WorkContent() {
  return (
    <main id="main-content" className="reading-page section-shell work-page">
      <header className="page-heading">
        <p className="eyebrow">The engineering notebook</p>
        <h1>
          Things I’ve put
          <br />
          <em>into the world.</em>
        </h1>
        <p>
          Business software, safe workflows and real-time infrastructure. A
          closer look at the decisions beneath the interface.
        </p>
      </header>
      <EngineeringStudies standalone />
      <section className="work-archive" id="archive">
        <p className="eyebrow">Earlier work & experiments</p>
        <h2>The full collection.</h2>
        <ProjectArchive />
      </section>
    </main>
  );
}
