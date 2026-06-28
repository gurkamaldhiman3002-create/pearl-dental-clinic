import RatingStars from "@/app/components/feedback/RatingStars";
import { clinicInformation } from "@/app/lib/clinicContent";
import type { AdminPatientFeedback } from "@/app/types/feedback";

type FeedbackManagementProps = {
  feedbackEntries: AdminPatientFeedback[];
  isLoading: boolean;
  onToggleApproval: (
    feedbackId: AdminPatientFeedback["id"],
    isApproved: boolean,
  ) => void;
  updatingFeedbackId: AdminPatientFeedback["id"] | null;
};

function formatFeedbackDate(value: string | null) {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: clinicInformation.timeZone,
  }).format(date);
}

function FeedbackStatusBadge({ isApproved }: { isApproved: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        isApproved
          ? "border-[#bed3c4] bg-[#edf4ef] text-[#35664e]"
          : "border-[#dec487] bg-[#faf2e2] text-[#7d602e]"
      }`}
    >
      {isApproved ? "Approved" : "Hidden"}
    </span>
  );
}

function ModerationButton({
  feedback,
  isUpdating,
  onToggleApproval,
}: {
  feedback: AdminPatientFeedback;
  isUpdating: boolean;
  onToggleApproval: FeedbackManagementProps["onToggleApproval"];
}) {
  const nextApprovalState = !feedback.is_approved;

  return (
    <button
      type="button"
      disabled={isUpdating}
      onClick={() => onToggleApproval(feedback.id, nextApprovalState)}
      className={`rounded-full px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        feedback.is_approved
          ? "border border-[#e6c2bb] bg-[#fffdf9] text-[#925147] hover:bg-[#fbefec]"
          : "bg-[#205356] text-white hover:bg-[#183f41]"
      }`}
    >
      {isUpdating
        ? "Updating"
        : feedback.is_approved
          ? "Hide"
          : "Approve"}
    </button>
  );
}

export default function FeedbackManagement({
  feedbackEntries,
  isLoading,
  onToggleApproval,
  updatingFeedbackId,
}: FeedbackManagementProps) {
  const approvedCount = feedbackEntries.filter(
    (feedback) => feedback.is_approved,
  ).length;
  const hiddenCount = feedbackEntries.length - approvedCount;

  return (
    <section className="pearl-dashboard-card mt-8 p-5 md:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="pearl-kicker mb-2">
            Patient Feedback
          </p>
          <h2 className="text-3xl text-[#183f41] sm:text-4xl">
            Visit reviews waiting for a quick look.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Approve warm patient notes for the homepage, or hide them when they
            are not ready to share publicly.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:w-auto">
          <div className="pearl-surface-soft rounded-2xl px-4 py-3">
            <p className="pearl-kicker">
              Approved
            </p>
            <p className="mt-1 text-2xl text-[#183f41]">{approvedCount}</p>
          </div>
          <div className="pearl-surface-soft rounded-2xl px-4 py-3">
            <p className="pearl-kicker">
              Hidden
            </p>
            <p className="mt-1 text-2xl text-[#183f41]">{hiddenCount}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-7 rounded-2xl border border-[#eadfcf] bg-[#f8f3ea] p-5 text-sm text-slate-600">
          Loading patient feedback...
        </div>
      ) : feedbackEntries.length === 0 ? (
        <div className="mt-7 rounded-2xl border border-[#eadfcf] bg-[#f8f3ea] p-6">
          <h3 className="text-2xl text-[#183f41]">No feedback yet</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Patient reviews submitted from the feedback page will appear here
            for approval before they are shown on the homepage.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-7 hidden overflow-hidden rounded-2xl border border-[#eadfcf] lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#183f41] text-white">
                <tr>
                  <th className="px-5 py-4 font-semibold">Patient</th>
                  <th className="px-5 py-4 font-semibold">Rating</th>
                  <th className="px-5 py-4 font-semibold">Treatment</th>
                  <th className="px-5 py-4 font-semibold">Feedback</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee2cf] bg-[#fffdf9]">
                {feedbackEntries.map((feedback) => (
                  <tr key={feedback.id} className="align-top">
                    <td className="px-5 py-4 font-semibold text-blue-950">
                      {feedback.name}
                    </td>
                    <td className="px-5 py-4">
                      <RatingStars rating={feedback.rating} />
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {feedback.rating}/5
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {feedback.treatment}
                    </td>
                    <td className="max-w-md px-5 py-4 text-slate-600">
                      {feedback.feedback}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatFeedbackDate(feedback.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <FeedbackStatusBadge isApproved={feedback.is_approved} />
                    </td>
                    <td className="px-5 py-4">
                      <ModerationButton
                        feedback={feedback}
                        isUpdating={updatingFeedbackId === feedback.id}
                        onToggleApproval={onToggleApproval}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-7 grid gap-4 lg:hidden">
            {feedbackEntries.map((feedback) => (
              <article
                key={feedback.id}
                className="pearl-surface-soft pearl-lift rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-blue-950">
                      {feedback.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {feedback.treatment}
                    </p>
                  </div>
                  <FeedbackStatusBadge isApproved={feedback.is_approved} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <RatingStars rating={feedback.rating} />
                  <span className="text-sm font-semibold text-slate-500">
                    {feedback.rating}/5
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-700">
                  {feedback.feedback}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase text-[#86632f]">
                  {formatFeedbackDate(feedback.created_at)}
                </p>
                <div className="mt-5">
                  <ModerationButton
                    feedback={feedback}
                    isUpdating={updatingFeedbackId === feedback.id}
                    onToggleApproval={onToggleApproval}
                  />
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
