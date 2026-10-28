import { Phone, Mail, MessageSquare, Copy, Check, ExternalLink } from 'lucide-react'
import type { PublicContact } from '@/types/database'
import { generateTelUrl } from '@/lib/phone/tel'
import { generateWhatsAppUrl, isWhatsAppEligible } from '@/lib/phone/whatsapp'
import { useClipboard } from '@/hooks/useClipboard'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/utils/cn'

export interface ContactActionsProps {
  contacts: PublicContact[]
  mode?: 'compact' | 'full'
  className?: string
}

function ContactItemFull({ contact }: { contact: PublicContact }) {
  const { copy, copied } = useClipboard()
  const toast = useToast()

  const handleCopy = async () => {
    await copy(contact.display_value)
    toast(`Copied ${contact.display_value} to clipboard`, 'success')
  }

  const isPhone = contact.contact_type === 'mobile_phone' || contact.contact_type === 'office_phone'
  const isEmail = contact.contact_type === 'email'
  const telUrl = isPhone ? generateTelUrl(contact.display_value) : null
  const canWhatsApp = isPhone && isWhatsAppEligible(contact.display_value)
  const whatsAppUrl = canWhatsApp ? generateWhatsAppUrl(contact.display_value) : null

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border bg-white hover:border-brand-300 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600 shrink-0">
          {contact.contact_type === 'email' && <Mail className="w-5 h-5" />}
          {contact.contact_type === 'mobile_phone' && <Phone className="w-5 h-5" />}
          {contact.contact_type === 'office_phone' && <Phone className="w-5 h-5 text-teal-600" />}
          {contact.contact_type === 'other' && <ExternalLink className="w-5 h-5" />}
        </div>
        <div>
          <span className="text-xs uppercase font-medium text-text-muted tracking-wide block">
            {contact.contact_type.replace('_', ' ')}
          </span>
          <span className="text-base font-medium text-text-primary select-all">
            {contact.display_value}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
        {telUrl && (
          <a
            href={telUrl}
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
            aria-label={`Call ${contact.display_value}`}
          >
            <Phone className="w-3.5 h-3.5 text-brand-600" />
            <span>Call</span>
          </a>
        )}

        {whatsAppUrl && (
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm flex items-center gap-1.5 text-teal-700 hover:text-teal-800"
            aria-label={`Open WhatsApp chat with ${contact.display_value}`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
            <span>WhatsApp</span>
          </a>
        )}

        {isEmail && (
          <a
            href={`mailto:${contact.display_value}`}
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
            aria-label={`Send email to ${contact.display_value}`}
          >
            <Mail className="w-3.5 h-3.5 text-brand-600" />
            <span>Email</span>
          </a>
        )}

        <button
          type="button"
          onClick={handleCopy}
          className="btn btn-ghost btn-sm p-2 text-text-muted hover:text-text-primary"
          aria-label={`Copy ${contact.display_value}`}
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}

export function ContactActions({
  contacts,
  mode = 'compact',
  className,
}: ContactActionsProps) {
  const { copy, copied } = useClipboard()
  const toast = useToast()

  if (!contacts || contacts.length === 0) {
    return null
  }

  if (mode === 'full') {
    return (
      <div className={cn('space-y-3', className)}>
        {contacts.map((contact) => (
          <ContactItemFull key={contact.id} contact={contact} />
        ))}
      </div>
    )
  }

  // Compact mode (icons with direct actions for cards)
  const phoneContact = contacts.find((c) => c.contact_type === 'mobile_phone' || c.contact_type === 'office_phone')
  const emailContact = contacts.find((c) => c.contact_type === 'email')

  const telUrl = phoneContact ? generateTelUrl(phoneContact.display_value) : null
  const whatsAppUrl =
    phoneContact && isWhatsAppEligible(phoneContact.display_value)
      ? generateWhatsAppUrl(phoneContact.display_value)
      : null

  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      onClick={(e) => e.stopPropagation()}
    >
      {telUrl && (
        <a
          href={telUrl}
          className="p-2 rounded-md bg-surface-subtle hover:bg-brand-50 text-text-secondary hover:text-brand-600 transition-colors"
          aria-label="Direct Phone Call"
          title={`Call ${phoneContact?.display_value}`}
        >
          <Phone className="w-4 h-4" />
        </a>
      )}

      {whatsAppUrl && (
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-600 transition-colors"
          aria-label="Chat on WhatsApp"
          title={`WhatsApp ${phoneContact?.display_value}`}
        >
          <MessageSquare className="w-4 h-4" />
        </a>
      )}

      {emailContact && (
        <a
          href={`mailto:${emailContact.display_value}`}
          className="p-2 rounded-md bg-surface-subtle hover:bg-brand-50 text-text-secondary hover:text-brand-600 transition-colors"
          aria-label="Send Email"
          title={`Email ${emailContact.display_value}`}
        >
          <Mail className="w-4 h-4" />
        </a>
      )}

      {phoneContact && (
        <button
          type="button"
          onClick={async () => {
            await copy(phoneContact.display_value)
            toast(`Copied ${phoneContact.display_value}`, 'success')
          }}
          className="p-2 rounded-md bg-surface-subtle hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
          aria-label="Copy Phone Number"
          title="Copy Phone Number"
        >
          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
        </button>
      )}
    </div>
  )
}
