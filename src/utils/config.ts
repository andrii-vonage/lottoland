export const warnSmsTextLength = parseInt(
  process.env.NEXT_PUBLIC_WARN_SMS_TEXT_LENGTH || "160",
  10
);

export const maxSmsTextLength = parseInt(
  process.env.NEXT_PUBLIC_MAX_SMS_TEXT_LENGTH || "320",
  10
);

export const pageSize = 10;
