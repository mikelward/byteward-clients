/**
 * Byteward branding for the browser extension's locale messages.
 *
 * Applied when the build copies `src/_locales` into the extension, so the
 * source `messages.json` files stay exactly as upstream has them. That keeps
 * upstream's rule that existing messages are immutable (they are owned by its
 * translation pipeline) and keeps upstream merges free of conflicts in every
 * locale.
 *
 * Every message that says "Bitwarden" says "Byteward" instead, except the ones
 * about Bitwarden's service and its other products, which are still accurate:
 * the extension still talks to Bitwarden's servers and pairs with the
 * Bitwarden desktop app.
 */

/** Messages about Bitwarden's service or other Bitwarden products. */
const KEEP_BITWARDEN = new Set([
  // Accounts, the web app, help and support, and other Bitwarden products
  "newToBitwarden",
  "continueToWebAppDesc",
  "continueToHelpCenterDesc",
  "changeMasterPasswordOnWebConfirmation",
  "moreFromBitwarden",
  "bitwardenForBusiness",
  "bitwardenAuthenticator",
  "continueToAuthenticatorPageDesc",
  "bitwardenSecretsManager",
  "continueToSecretsManagerPageDesc",
  "freeBitwardenFamilies",
  "freeBitwardenFamiliesPageDesc",
  "helpCenter",
  "communityForums",
  "contactSupport",
  "bitWebVaultApp",
  "bitwardenSupport",
  "twoStepLoginConfirmationContent",
  "passwordProtectedOptionDescription",
  "encExportAccountWarningDesc",
  "bitwardenForBusinessPageDesc",
  "premiumPurchaseAlertV2",
  "authenticatorAppDescV2",
  "selfHostedBaseUrlHint",
  "updateEncryptionKeyWarning",
  "receiveMarketingEmails",
  "couldNotDecryptVaultItem",
  "couldNotDecryptVaultItems",
  "importDataSecureByDesignBody",
  "importGnomeInstructionsFileHere",
  "bitwardenAccount",
  "downloadBitwarden",
  "downloadBitwardenOnAllDevices",
  "getTheMobileAppDesc",
  "secureDevicesBody",
  "emptyVaultNudgeBody",
  "removeMasterPasswordForOrgUserKeyConnector",
  "downloadBitwardenApps",
  "newExperienceDialogTitle",
  "newExperienceDialogDesc",
  "newExperienceDialogImgAlt",
  // The Bitwarden desktop app, which the extension pairs with for biometrics
  "awaitDesktopDesc",
  "desktopIntegrationDisabledDesc",
  "startDesktopTitle",
  "startDesktopDesc",
  "nativeMessagingPermissionErrorDesc",
  "biometricsStatusHelptextDesktopDisconnected",
  "biometricsStatusHelptextNotEnabledInDesktop",
  "sessionTimeoutSuppressedByConnectedDevice",
  "sharedUnlockDesktopPermissionDesc",
  "biometricPermissionDesc",
  // Names both the extension and the Bitwarden desktop app; English is
  // reworded in OVERRIDES, and translations keep the original rather than
  // renaming both.
  "syncUnlockWithDesktopDescription1",
]);

/** Messages reworded rather than renamed, by locale. */
const OVERRIDES = {
  en: {
    extDesc:
      "A Bitwarden-compatible password manager with extra conveniences, like a default username for new logins",
    syncUnlockWithDesktopDescription1:
      "The Byteward browser extension and the Bitwarden desktop app lock and unlock together. Biometrics will be used if available.",
  },
};

/**
 * Returns the Byteward-branded version of one locale's messages.
 *
 * @param {Record<string, {message: string}>} messages A parsed messages.json.
 * @param {string} locale The locale directory name, e.g. "en" or "pt_BR".
 */
function brandMessages(messages, locale) {
  const overrides = OVERRIDES[locale] ?? {};
  const branded = {};
  for (const [key, entry] of Object.entries(messages)) {
    if (key in overrides) {
      branded[key] = { ...entry, message: overrides[key] };
    } else if (!KEEP_BITWARDEN.has(key) && entry.message?.includes("Bitwarden")) {
      branded[key] = { ...entry, message: entry.message.replaceAll("Bitwarden", "Byteward") };
    } else {
      branded[key] = entry;
    }
  }
  return branded;
}

/**
 * A CopyWebpackPlugin `transform` for files under `src/_locales`: brands each
 * `<locale>/messages.json` and passes anything else through unchanged.
 */
function transformLocaleFile(content, absoluteFrom) {
  const match = absoluteFrom.match(/[\\/]_locales[\\/]([^\\/]+)[\\/]messages\.json$/);
  if (!match) {
    return content;
  }
  const messages = JSON.parse(content.toString());
  return JSON.stringify(brandMessages(messages, match[1]), null, 2);
}

module.exports = { brandMessages, transformLocaleFile, KEEP_BITWARDEN };
