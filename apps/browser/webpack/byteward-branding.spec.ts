import { brandMessages, transformLocaleFile } from "./byteward-branding";

describe("byteward branding", () => {
  it("renames the extension where a message refers to itself", () => {
    const branded = brandMessages(
      { notificationAddDesc: { message: "Should Bitwarden remember this password for you?" } },
      "de",
    );

    expect(branded.notificationAddDesc.message).toBe(
      "Should Byteward remember this password for you?",
    );
  });

  it("keeps Bitwarden where a message is about Bitwarden's service", () => {
    const branded = brandMessages({ bitwardenAccount: { message: "Bitwarden account" } }, "en");

    expect(branded.bitwardenAccount.message).toBe("Bitwarden account");
  });

  it("applies locale overrides and keeps other fields", () => {
    const branded = brandMessages(
      { extDesc: { message: "Bitwarden easily secures…", description: "Store description" } },
      "en",
    );

    expect(branded.extDesc.message).toMatch(/^A Bitwarden-compatible password manager/);
    expect(branded.extDesc.description).toBe("Store description");
  });

  it("brands messages.json files and passes other files through", () => {
    const messages = Buffer.from(JSON.stringify({ appName: { message: "Bitwarden" } }));

    const branded = JSON.parse(
      transformLocaleFile(messages, "/repo/apps/browser/src/_locales/fr/messages.json").toString(),
    );
    const other = transformLocaleFile(messages, "/repo/apps/browser/src/_locales/README.md");

    expect(branded.appName.message).toBe("Byteward");
    expect(other).toBe(messages);
  });
});
