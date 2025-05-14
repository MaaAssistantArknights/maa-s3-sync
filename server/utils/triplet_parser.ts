const extTypeMapper = (ext: string) => {
  switch(ext) {
    case 'AppImage':
      return 'appimage'
    case 'tar.gz':
      return ''
    case 'zip':
      return ''
    case 'dmg':
      return 'dmg'
    default:
      return ''
  }
}

export default function parseTriplet(filename: string): string {
  const extname = filename.split('.').pop() || ''
  const type = extTypeMapper(extname)
  // MAA-v
  const regex = /^MAA-v.+-(.+?)-(.+?)\..+$/
  const matches = filename.match(regex)
  const matched = matches && matches.length >= 3
  const os = matched ? matches[1] : ''
  const arch = matched ? matches[2] : ''
  if (!matched) {
    return ''
  }
  if (!['win', 'macos', 'linux'].includes(os)) {
    return ''
  }
  return [os, arch, type].filter(Boolean).join('-')
}
