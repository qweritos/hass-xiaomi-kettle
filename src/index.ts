import './dialog-content';
import './editor';
import './card';
import { installMoreInfoInterceptor } from './more-info-interceptor';
import { installNotificationIconInterceptor } from './notification-icon-interceptor';
import { installStartupRecovery } from './startup-recovery';

void installMoreInfoInterceptor();
void installNotificationIconInterceptor();
installStartupRecovery();

console.info(
  `%c XIAOMI-KETTLE-CARD %c ${__CARD_VERSION__} `,
  'color:white;background:#03a9f4;font-weight:700',
  'color:#03a9f4;background:transparent',
);
