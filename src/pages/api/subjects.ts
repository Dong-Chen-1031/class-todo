import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  const NOTION_TOKEN = import.meta.env.NOTION_TOKEN;
  const NOTION_DATABASE_ID = import.meta.env.NOTION_DATABASE_ID;

  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    return new Response(
      JSON.stringify({ error: "Missing Notion Token or Database ID" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    // Step 2: Retrieve the data source schema to get select options
    const dsRes = await fetch(
      `https://api.notion.com/v1/data_sources/${NOTION_DATABASE_ID}`,
      {
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2026-03-11",
        },
      },
    );

    if (!dsRes.ok) {
      const errText = await dsRes.text();
      console.error("Notion API Error fetching data source:", errText);
      throw new Error(`HTTP ${dsRes.status} - ${dsRes.statusText}`);
    }

    const dsData = await dsRes.json();

    const options: string[] =
      dsData.properties?.["科目"]?.select?.options?.map(
        (opt: { name: string }) => opt.name,
      ) ?? [];

    return new Response(JSON.stringify({ subjects: options }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, max-age=3600",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
