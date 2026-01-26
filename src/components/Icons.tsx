import type { IconProps } from '../types'

export const HomeIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
)

export const StatsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

export const PlayIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
)

export const PauseIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
)

export const StopIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12" />
  </svg>
)

export const ClockIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
)

export const StopwatchIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2" />
    <path d="M5 3L2 6" />
    <path d="M22 6l-3-3" />
    <path d="M12 5V2" />
    <path d="M10 2h4" />
  </svg>
)

export const CloseIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export const PlusIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

export const CoffeeIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8h1a4 4 0 010 8h-1" />
    <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
)

export const SettingsIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

export const QuoteIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
  </svg>
)

export const FireIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 23c-3.866 0-7-3.134-7-7 0-2.251.895-4.112 2.104-5.728.573-.766 1.224-1.479 1.893-2.166.173-.177.3-.254.391-.272.234-.046.44.158.354.387-.174.466-.377.936-.515 1.46-.105.4-.146.758-.149 1.133 0 .295.022.557.081.831.136.654.408 1.188.789 1.646.141.17.34.349.5.336.172-.013.288-.242.276-.432-.019-.303-.039-.647.002-1.003.071-.616.278-1.266.596-1.912.367-.745.859-1.483 1.47-2.199.744-.873 1.633-1.713 2.636-2.503.153-.121.288-.176.397-.167.217.018.33.235.277.457-.113.48-.285.954-.417 1.437-.085.309-.148.62-.187.94-.086.706-.016 1.45.194 2.187.324 1.139.955 2.156 1.855 2.955.136.121.292.174.414.158.208-.027.326-.255.261-.487-.182-.654-.303-1.325-.33-2.015-.032-.859.08-1.748.343-2.652.357-1.23.966-2.408 1.815-3.515.13-.17.24-.258.345-.277.227-.043.385.178.322.423-.085.328-.197.647-.268.981-.058.272-.087.517-.099.784-.023.525.034 1.076.197 1.632.243.828.676 1.614 1.306 2.332.092.105.178.146.251.139.148-.013.237-.192.186-.377-.113-.411-.165-.834-.154-1.266.014-.563.124-1.136.344-1.706.349-.904.918-1.765 1.645-2.558.153-.168.274-.255.388-.265.233-.022.393.235.309.5-.075.237-.176.467-.237.711-.076.302-.107.596-.109.901-.004.715.162 1.461.464 2.192.448 1.083 1.143 2.093 2.004 2.991.136.142.262.197.36.177.206-.042.309-.308.217-.54-.14-.354-.238-.718-.288-1.092-.064-.476-.053-.97.033-1.476.102-.601.294-1.196.562-1.782.095-.209.156-.319.245-.35.169-.059.323.073.352.272C20.923 8.85 21 9.468 21 10c0 7.18-4.03 13-9 13z" />
  </svg>
)
