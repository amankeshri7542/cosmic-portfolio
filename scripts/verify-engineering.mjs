import assert from "node:assert/strict";
import fs from "node:fs";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.PORTFOLIO_URL || "http://127.0.0.1:3000";
const directory = "docs/qa/engineering";
fs.mkdirSync(directory, { recursive:true });
const report = { checks:[], errors:[] };
const check = (name, condition) => { assert.ok(condition,name); report.checks.push(name); };
const browser = await chromium.launch({channel:"chrome",headless:true});
try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const requests=[];
  page.on("pageerror",error=>report.errors.push(error.message));
  page.on("request",request=>requests.push(request.url()));
  const response = await page.goto(origin,{waitUntil:"networkidle"});
  check("homepage responds",response.status()===200);
  check("engineering role is explicit",(await page.locator(".engineer-intro").innerText()).toLowerCase().includes("software engineer"));
  check("eight technology logos load",await page.locator(".stack-strip img").evaluateAll(images=>images.length===8&&images.every(image=>image.complete&&image.naturalWidth>0)));
  check("only the decorative ribbon canvas",await page.locator("canvas").count()===1 && await page.locator(".object-satellite").count()===0);
  const background=page.locator(".stack-atmosphere");
  const pixels=()=>background.evaluate(canvas=>canvas.toDataURL());
  const before=await pixels();
  await page.waitForTimeout(180);
  check("ribbon animates",before!==await pixels());
  check("ribbon never captures touch or scroll",await background.evaluate(canvas=>getComputedStyle(canvas).pointerEvents)==="none");
  check("no background or motion pause controls",await page.getByRole("button",{name:/pause (background|motion)|play background|resume motion/i}).count()===0);
  check("no model downloads",requests.every(url=>!url.includes(".glb")&&!url.includes("draco")));
  for(let i=0;i<4;i++) {
    const layer=page.locator(".stack-selection button").nth(i);
    await layer.click();
    check(`layer ${i} selected`,await layer.getAttribute("aria-pressed")==="true");
    check(`layer ${i} has project evidence`,(await page.locator(".stack-detail a").getAttribute("href")).startsWith("#"));
    check(`layer ${i} visibly selected`,await page.locator(".stack-plane").nth(i).getAttribute("aria-pressed")==="true");
  }
  await page.locator(".stack-plane").first().focus();await page.keyboard.press("Enter");
  check("3D planes keyboard operable",await page.locator(".stack-plane").first().getAttribute("aria-pressed")==="true");
  check("stack keeps moving",await page.locator(".stack-assembly").evaluate(e=>getComputedStyle(e).animationPlayState==="running" && getComputedStyle(e).animationName!=="none"));
  check("three engineering case studies",await page.locator(".study").count()===3);
  check("case study technologies visible",await page.locator(".study-stack li").count()>=12);
  for(const details of await page.locator(".study-details").all()) {
    await details.locator("summary").click();
    check("case study opens",await details.getAttribute("open")!==null);
  }
  await page.locator("#ai-work").scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>Array.from(document.querySelectorAll(".ai-project-image img")).every(i=>i.complete&&i.naturalWidth>0));
  check("three AI projects have images",await page.locator(".ai-projects article").count()===3);
  await page.screenshot({path:`${directory}/ai-desktop.png`});
  await page.getByRole("searchbox",{name:"Find a project"}).fill("Gemini");
  check("archive filters by technology",await page.locator(".archive-record").count()===1);
  await page.getByRole("searchbox",{name:"Find a project"}).fill("");
  await page.locator(".delivery-controls input").check();
  await page.getByRole("button",{name:"Send a sample message"}).click();
  check("delivery demonstration still works",await page.locator(".delivery-recipients .delivered").count()===2);
  const routes=["/","/work","/about","/blogs","/blogs/aws-db","/blogs/one-sale-three-records","/blogs/when-a-recipient-goes-offline","/blogs/patterns-between-patterns","/contact","/write","/thank-you"];
  for(const route of routes) {
    await page.goto(origin+route,{waitUntil:"networkidle"});
    check(`${route}: main heading`,await page.locator("h1").count()===1);
    for(const width of [320,390,760,943,1280,1920]) {
      await page.setViewportSize({width,height:900});
      await page.waitForFunction(()=>document.querySelector(".stack-atmosphere").width===Math.round(innerWidth*Math.min(devicePixelRatio||1,1.5)));
      check(`${route}: ${width}px fits`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(route==="/") check(`background fits at ${width}px`,await background.evaluate(canvas=>canvas.getBoundingClientRect().width===innerWidth && canvas.width<=innerWidth*1.5+1));
      if(route==="/" && width<=760) check(`3D planes remain inside their frame at ${width}px`,await page.locator(".stack-scene").evaluate(scene=>{
        const frame=scene.getBoundingClientRect();
        return Array.from(scene.querySelectorAll(".stack-plane")).every(plane=>{const box=plane.getBoundingClientRect();return box.left>=frame.left && box.right<=frame.right && box.top>=frame.top && box.bottom<=frame.bottom;});
      }));
    }
    check(`${route}: dark surface`,await page.evaluate(()=>getComputedStyle(document.body).backgroundColor)==="rgb(8, 11, 23)");
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(origin,{waitUntil:"networkidle"});
  await page.getByRole("button",{name:"Open navigation",exact:true}).click();
  check("mobile stack link available",await page.getByRole("navigation",{name:"Mobile navigation"}).getByRole("link",{name:"Stack"}).isVisible());
  await page.getByRole("navigation",{name:"Mobile navigation"}).getByRole("link",{name:"Stack"}).click();
  check("mobile navigation closes",await page.locator(".mobile-menu").getAttribute("open")===null);
  await page.emulateMedia({reducedMotion:"reduce"});
  check("reduced motion honored",await page.locator(".stack-assembly").evaluate(e=>getComputedStyle(e).animationName)==="none");
  await page.waitForTimeout(100);
  const still=await pixels();
  await page.waitForTimeout(180);
  check("reduced motion freezes background",still===await pixels());
  await page.emulateMedia({reducedMotion:"no-preference"});
  await page.evaluate(()=>{document.activeElement?.blur();scrollTo({top:0,behavior:"instant"});});
  await page.screenshot({path:`${directory}/hero-mobile.png`});
  await page.locator(".tech-explorer").screenshot({path:`${directory}/stack-mobile.png`});
  await page.setViewportSize({width:1440,height:1000});
  await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));
  await page.screenshot({path:`${directory}/hero-desktop.png`});
  // Load below-fold images before the full-page review capture.
  await page.locator("#ai-work").scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>Array.from(document.querySelectorAll(".ai-project-image img")).every(i=>i.complete&&i.naturalWidth>0));
  await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));
  await page.screenshot({path:`${directory}/home-desktop.png`,fullPage:true});
  check("no browser runtime errors",report.errors.length===0);
  const fallback=await browser.newPage();
  await fallback.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null;});
  await fallback.goto(origin,{waitUntil:"networkidle"});
  check("content works without canvas",await fallback.locator(".engineer-intro h1").isVisible());
  await fallback.locator(".stack-selection button").nth(1).click();
  check("stack works without canvas",await fallback.locator(".stack-selection button").nth(1).getAttribute("aria-pressed")==="true");
  await fallback.close();
  console.log(JSON.stringify({passed:report.checks.length,errors:report.errors}));
} finally {
  fs.writeFileSync(`${directory}/verification.json`,JSON.stringify(report,null,2));
  await browser.close();
}
