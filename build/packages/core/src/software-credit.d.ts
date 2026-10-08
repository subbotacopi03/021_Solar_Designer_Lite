/** OpenPV / Solar Designer Lite. Project origin and reuse: see ATTRIBUTION.md. */
export type SoftwareAttribution = {
    project_name: string;
    copyright_holder: string | null;
    author_url: string | null;
    source_url: string | null;
    version: string;
};
export declare function softwareCredit(data: SoftwareAttribution, language: "uk" | "en"): string[];
