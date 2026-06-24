// Centers the app inside a phone-sized frame on larger screens,
// and goes full-bleed on actual phones.
export default function PhoneFrame({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cocoa sm:p-6">
      <div
        className="relative w-full sm:max-w-[400px] sm:rounded-[2.5rem] sm:border-[10px] sm:border-black sm:shadow-2xl overflow-hidden bg-cream"
        style={{ height: '100dvh', maxHeight: '880px' }}
      >
        {children}
      </div>
    </div>
  )
}
