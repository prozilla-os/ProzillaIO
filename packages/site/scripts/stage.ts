import fs from "node:fs";
import { appsConfig } from "../src/config/apps.config";
import { ANSI } from "../src/constants/_utils/utils.const";
import { NAME, TAG_LINE } from "../src/config/branding.config";
import { BASE_URL, BUILD_DIR, DOMAIN } from "../src/config/deploy.config";
import { name } from "../package.json";

const PATHS = {
	sitemapXml: BUILD_DIR + "/sitemap.xml",
	robotsTxt: BUILD_DIR + "/robots.txt",
	indexHtml: BUILD_DIR + "/index.html",
	cname: BUILD_DIR + "/CNAME",
};

function generateSitemapXml() {
	const date = new Date();
	const lastModified = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

	const pages = appsConfig.apps.map(({ id }) => `
	<url>
		<loc>${BASE_URL + id}</loc>
		<lastmod>${lastModified}</lastmod>
	</url>`
	);

	const sitemap = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xml>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
	xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
	<url>
		<loc>${BASE_URL}</loc>
		<lastmod>${lastModified}</lastmod>
	</url>
	${pages.join("")}
</urlset>`;

	return sitemap.trim();
}

function generateRobotsTxt() {
	const sitemapUrl = BASE_URL + PATHS.sitemapXml.replace(BUILD_DIR + "/", "");

	return `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:
Sitemap: ${sitemapUrl}`;
}

function generateCname() {
	return DOMAIN;
}

function generateTemplate(html: string) {
	const baseUrlRegex = /(?<=")https?:\/\/[a-z0-9-]+(\.)([a-zA-Z0-9-]+(\.))*[a-z]{2,3}\/(?=.*")/gi;
	html = html.replaceAll(baseUrlRegex, BASE_URL);

	const commentsRegex = /<!--.*?-->/g;
	html = html.replaceAll(commentsRegex, "");

	const emptyLinesRegex = /^\s*$\n/gm;
	html = html.replaceAll(emptyLinesRegex, "");

	const path = `${BUILD_DIR}/index.html`;
	fs.writeFileSync(path, html, { flag: "w+" });
	console.log(`- ${ANSI.fg.cyan}${path}${ANSI.reset}`);

	return html;
}

/**
 * To avoid GitHub pages rendering certain pages that are only defined by React router as a 404 page,
 * we copy the content of our index file to the 404 page, letting React router properly handle routing on every page 
 */
function generate404Page(template: string) {
	const path = `${BUILD_DIR}/404.html`;
	fs.writeFileSync(path, template, { flag: "w+" });
	console.log(`- ${ANSI.fg.cyan}${path}${ANSI.reset}`);
}

/**
 * Add an HTML file for every app page so they can be properly crawled and indexed
 */
function generateAppPages(template: string) {
	for (const app of appsConfig.apps) {
		const appId = app.id;
		const appName = app.name;
		const appDescription = app.description ?? TAG_LINE;

		if (appId === "index") {
			console.log("Invalid app ID found: " + appId);
			return;
		}

		let html = template;
		
		const titleRegex = /(?<=(<title>|<meta property="og:title" content="|<meta name="twitter:title" content="))(([a-zA-Z|-]|\s)+)(?=(<\/title>|"\/?>))/g;
		html = html.replaceAll(titleRegex, `${appName} | ${NAME}`);

		const descriptionRegex = /(?<=(<meta name="description" content="|<meta property="og:description" content="|<meta name="twitter:description" content="))(([a-zA-Z-.]|\s)+)(?=("\/?>))/g;
		html = html.replaceAll(descriptionRegex, appDescription);

		const canonicalRegex = /(?<=(<link rel="canonical" href="|<meta name="twitter:url" content="|<meta property="og:url" content="))(http(s)?:\/\/[a-zA-Z-.]+\/)(?=("\/?>))/g;
		html = html.replaceAll(canonicalRegex, BASE_URL + appId);

		const faqRegex = /<!-- FAQ -->.*?<script type="application\/ld\+json">.*?<\/script>/gs;
		html = html.replaceAll(faqRegex, "");

		const path = `${BUILD_DIR}/${appId}.html`;
		fs.writeFileSync(path, html, { flag: "w+" });
		console.log(`- ${ANSI.fg.cyan}${path}${ANSI.reset}`);
	}
}

function stage() {
	try {
		console.log(`Context: ${ANSI.decoration.bold}${name}${ANSI.reset}\n`);
		console.log(`${ANSI.fg.yellow}Staging build...${ANSI.reset}`);
	
		const files: [string, () => string][] = [
			[PATHS.sitemapXml, generateSitemapXml],
			[PATHS.robotsTxt, generateRobotsTxt],
			[PATHS.cname, generateCname],
		];
	
		files.forEach(([path, generateContent]) => {
			const directory = path.substring(0, path.lastIndexOf("/"));
			if (directory != "" && !fs.existsSync(directory))
				fs.mkdirSync(directory, { recursive: true });
	
			fs.writeFileSync(path, generateContent(), { flag: "w+" });
			console.log(`- ${ANSI.fg.cyan}${path}${ANSI.reset}`);
		});
	
		console.log(`\n${ANSI.fg.yellow}Generating pages...${ANSI.reset}`);
	
		const html = fs.readFileSync(PATHS.indexHtml, "utf-8");
		const template = generateTemplate(html);
	
		generate404Page(template);
		generateAppPages(template);
	
		console.log(`\n${ANSI.fg.green}✓ Staging complete${ANSI.reset}`);
	} catch (error) {
		console.error(error);
		console.log(`${ANSI.fg.red}⚠ Staging failed${ANSI.reset}`);
		process.exit(1);
	}
}

stage();