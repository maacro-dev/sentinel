import { QRCodeSVG } from "qrcode.react"

type MfidQRProps = {
  mfid: string,
  fgColor?: string,
}

export function MfidQR({ mfid, fgColor = "#0a0a0a" }: MfidQRProps) {
  return (
    <QRCodeSVG
      value={mfid}
      level='H'
      fgColor={fgColor}
      imageSettings={{
        src: "/qrlogo.svg",
        height: 28,
        width: 28,
        excavate: true
      }}
    />
  )
}
