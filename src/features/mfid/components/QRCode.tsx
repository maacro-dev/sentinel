import { QRCodeSVG } from "qrcode.react"

type MfidQRProps = {
  mfid: string,
  fgColor?: string,
}

export function MfidQR({ mfid, fgColor = "#0a0a0a" }: MfidQRProps) {
  return (
    <QRCodeSVG
      value={mfid}
      level='M'
      fgColor={fgColor}
      imageSettings={{
        src: "/qrlogo.svg",
        height: 40,
        width: 40,
        excavate: true
      }}
    />
  )
}
