export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ch-gray flex flex-col">
      <div className="bg-ch-blue py-4 px-6 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="4" fill="white" fillOpacity="0.15"/>
          <path d="M18 5L7 10V18C7 24.08 11.84 29.76 18 31C24.16 29.76 29 24.08 29 18V10L18 5Z" fill="white" fillOpacity="0.9"/>
          <path d="M15 18L17 20L21 16" stroke="#003B8E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div>
          <p className="text-white font-bold text-base leading-tight">Red de Acopio</p>
          <p className="text-blue-200 text-xs">Coordinación de Emergencias · Chile</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  )
}
