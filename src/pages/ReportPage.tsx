import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { reportSchema, REPORT_TYPES, type ReportFormData } from '@/lib/validation/report.schema'
import { submitReport } from '@/services/reports.service'
import { formatReportType } from '@/utils/formatting'

export default function ReportPage() {
  const [searchParams] = useSearchParams()
  const lecturerId = searchParams.get('lecturer') ?? ''

  const [submitted, setSubmitted] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      lecturer_id: lecturerId || '',
      report_type: 'outdated_information',
      description: '',
      reporter_email: '',
    },
  })

  const onSubmit = async (data: ReportFormData) => {
    setSubmitError(null)
    try {
      await submitReport(data)
      setSubmitted(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit report'
      if (msg.toLowerCase().includes('too many')) {
        setSubmitError('You have submitted too many reports recently. Please wait 24 hours before trying again.')
      } else if (msg.toLowerCase().includes('not found')) {
        setSubmitError('The selected lecturer could not be found. Please check the URL and try again.')
      } else {
        setSubmitError('There was a problem submitting your report. Please try again.')
      }
    }
  }

  if (submitted) {
    return (
      <div className="container-narrow py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-light mb-6">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-3">Report submitted</h1>
        <p className="text-text-secondary mb-2">
          Thank you. Your report has been submitted and will be reviewed by an administrator.
        </p>
        <p className="text-text-muted text-sm">
          We do not send confirmation emails unless you provided your email and we need follow-up information.
        </p>
      </div>
    )
  }

  return (
    <>
      <title>Report Information | UniConnect</title>
      <div className="container-narrow py-10 md:py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Report Incorrect Information</h1>
          <p className="text-text-secondary">
            Found outdated or incorrect information? Help us keep the directory accurate.
            All reports are reviewed by an administrator.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 md:p-8 space-y-5" noValidate>
          <Input
            label="Lecturer ID (URL parameter)"
            hint="This is pre-filled if you arrived from a lecturer profile. Paste the lecturer profile URL if missing."
            error={errors.lecturer_id?.message}
            {...register('lecturer_id')}
          />

          <Select
            label="What type of issue are you reporting?"
            error={errors.report_type?.message}
            options={REPORT_TYPES.map((t: string) => ({ value: t, label: formatReportType(t) }))}
            {...register('report_type')}
          />

          <Textarea
            label="Description"
            required
            rows={4}
            hint="Please be as specific as possible. For phone numbers, provide the correct number if known."
            error={errors.description?.message}
            placeholder="e.g. The mobile number listed (+255 71X XXX XXX) is no longer in use. The correct number is +255 71Y YYY YYY."
            {...register('description')}
          />

          <Input
            label="Your email address (optional)"
            type="email"
            hint="Only used if an administrator needs to follow up on your report. Never shown publicly."
            error={errors.reporter_email?.message}
            {...register('reporter_email')}
          />

          {submitError && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-danger-light text-danger text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              {submitError}
            </div>
          )}

          <div className="pt-1">
            <Button type="submit" loading={isSubmitting} size="lg">
              Submit Report
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
