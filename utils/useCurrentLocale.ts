import { useI18n } from "#imports"

export default () => {
  const { locale, locales } = useI18n()

  return locales.value.find((l) => l.code === locale.value)!
}
