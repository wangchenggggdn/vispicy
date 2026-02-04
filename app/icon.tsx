import { ImageResponse } from 'next/og'

export const size = 32
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(to bottom, #dc2626, #b91c1c)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
        }}
      >
        🌶️
      </div>
    ),
    {
      width: size,
      height: size,
    }
  )
}
