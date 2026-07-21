const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER?.trim() || '56912345678'

const whatsappUrl = `https://wa.me/${whatsappNumber}`

export function WhatsAppFloatingButton() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Abrir WhatsApp"
      title="Chat por WhatsApp"
      className="floating-whatsapp"
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor" aria-hidden="true">
        <path d="M19.1 17.9c-.3-.1-1.8-.9-2-.9-.3-.1-.4-.1-.6.1l-.9 1.1c-.2.2-.3.2-.6.1-1.7-.8-3-2.7-3.1-2.9-.2-.2 0-.4.1-.5l.8-.9c.1-.1.2-.3.3-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.6-.9-2.2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.5 2.3 3.6 3.2 2.2 1 2.2.7 2.6.7.4 0 1.3-.5 1.4-1.1.2-.6.2-1 .1-1.1-.1-.1-.3-.1-.6-.3Z" />
        <path d="M16 3.2c-7 0-12.6 5.6-12.6 12.4 0 2.2.6 4.3 1.7 6.2L3 29l7.4-1.9a13 13 0 0 0 5.6 1.3c7 0 12.6-5.6 12.6-12.4S23 3.2 16 3.2Zm0 22.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-4.4 1.1 1.2-4.2-.3-.4a10 10 0 0 1-1.6-5.3c0-5.6 4.7-10.2 10.4-10.2s10.4 4.6 10.4 10.2S21.8 26 16 26Z" />
      </svg>
    </a>
  )
}
