import { Observable } from "rxjs";
/**
 * Service for managing vault settings.
 */
export abstract class VaultSettingsService {
  /**
   * An observable monitoring the state of the enable passkeys setting.
   * The observable updates when the setting changes.
   */
  abstract enablePasskeys$: Observable<boolean>;
  /**
   * An observable monitoring the state of the show cards on the current tab.
   */
  abstract showCardsCurrentTab$: Observable<boolean>;
  /**
   * An observable monitoring the state of the show identities on the current tab.
   */
  abstract showIdentitiesCurrentTab$: Observable<boolean>;
  /**
   * An observable monitoring the state of the visibility of at-risk password
   * notifications.
   *
   * This setting is only applicable for risk insights for premium users. Ciphers
   * that are marked as at-risk from an organization will always been shown
   * to users.
   */
  abstract showAtRiskPasswordNotifications$: Observable<boolean>;
  /**
   * An observable monitoring the username (typically an email address) that is
   * prefilled when creating a new login item. Emits `null` when none is set.
   */
  abstract defaultLoginUsername$: Observable<string | null>;

  /**
   * Saves the enable passkeys setting to disk.
   * @param value The new value for the passkeys setting.
   */
  abstract setEnablePasskeys(value: boolean): Promise<void>;
  /**
   * Saves the show cards on tab page setting to disk.
   * @param value The new value for the show cards on tab page setting.
   */
  abstract setShowCardsCurrentTab(value: boolean): Promise<void>;
  /**
   * Saves the show identities on tab page setting to disk.
   * @param value The new value for the show identities on tab page setting.
   */
  abstract setShowIdentitiesCurrentTab(value: boolean): Promise<void>;
  /**
   * Saves the visibility state of at-risk password notifications to disk.
   * @param value The new value for the visibility of at-risk password notifications.
   */
  abstract setShowAtRiskPasswordNotifications(value: boolean): Promise<void>;
  /**
   * Saves the username to prefill when creating a new login item.
   * @param value The new default username. Empty or whitespace-only values clear the setting.
   */
  abstract setDefaultLoginUsername(value: string | null): Promise<void>;
}
