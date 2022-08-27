import { ReminderBirthdayMailJob } from "./ReminderBirthdayMailJob";
import { SendForgotPasswordMailJob } from "./SendForgotPasswordMailJob";
import { ReportErrorToTeamByMailJob } from "./ReportErrorToTeamByMailJob";
import { SendVerificationLinkToUserMailJob } from "./SendVerificationLinkToUserMailJob";
import { PostgresBackupJob } from "./PostgresBackupJob";

export default {
  ReminderBirthdayMailJob,
  SendForgotPasswordMailJob,
  ReportErrorToTeamByMailJob,
  SendVerificationLinkToUserMailJob,
  PostgresBackupJob,
};
