<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const i18nHead = useLocaleHead()

useSeoMeta({
  title: t('layout.meta.title'),
  description: t('layout.meta.description'),
  ogTitle: t('layout.meta.ogTitle'),
  ogDescription: t('layout.meta.ogDescription'),
  ogImage: 'https://cbor.williamchong.cloud/images/cover.png',
  ogType: 'website',
})

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'CBOR to JSON Online Converter',
  description: 'Easily convert data between CBOR (Concise Binary Object Representation) and JSON (JavaScript Object Notation) formats with this online web decoder.',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  url: 'https://cbor.williamchong.cloud',
  author: {
    '@type': 'Person',
    name: 'William Chong',
    url: 'https://blog.williamchong.cloud'
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  }
}

useHead({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs!.lang
  },
  link: [...(i18nHead.value.link || [])],
  meta: [...(i18nHead.value.meta || [])],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(jsonLd)
    }
  ]
})
</script>
