import type { Metadata } from "next";
export const SITE_URL = "https://www.amankeshri.com";
export function pageMetadata(path: string, title: string, description: string): Metadata {
  return { title, description, alternates:{canonical:`${SITE_URL}${path}`}, openGraph:{type:"website",title,description,url:`${SITE_URL}${path}`,siteName:"Aman Kumar",locale:"en_US",images:[{url:`${SITE_URL}/opengraph-image`,width:1200,height:630,alt:"Aman Kumar — software engineering and field notes"}]}, twitter:{card:"summary_large_image",title,description,images:[`${SITE_URL}/opengraph-image`]} };
}
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,"\\u003c")}} />;
}
