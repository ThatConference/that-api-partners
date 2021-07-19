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
});

export default requiredConfig();
