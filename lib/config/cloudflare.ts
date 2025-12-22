export const cloudflareConfig = {
  accountId: process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID ?? "",
  playbackPolicy: "signed", // Toggle to "public" during local dev if you do not have signing tokens yet.
  exampleLiveInputId: "cf_live_input_id_placeholder"
};
