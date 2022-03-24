function configMissing(configKey) {
  throw new Error(`missing required .env setting for ${configKey}`);
}

const requiredConfig = () => ({
  postmarkApiToken:
    process.env.POSTMARK_API_TOKEN || configMissing('POSTMARK_API_TOKEN'),
  defaultProfileImage:
    'https://images.that.tech/members/person-placeholder.jpg',
  notificationEmailFrom:
    process.env.NOTIFICATION_EMAIL_FROM || 'hello@thatconference.com',
  // number of days past event endDate partner considered active
  activePartnerDays: process.env.ACTIVE_PARTNER_DAYS || 30,
});

export default requiredConfig();
