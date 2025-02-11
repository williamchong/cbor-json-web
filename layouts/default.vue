<template>
  <div>
    <slot />
  </div>
</template>
<script setup lang="ts">
useSeoMeta({
  title: 'CBOR to JSON Online Converter',
  description: 'Easily convert data between CBOR (Concise Binary Object Representation) and JSON (JavaScript Object Notation) formats with this online web decoder.',
  ogTitle: 'CBOR to JSON Online Converter',
  ogDescription: 'Easily convert data between CBOR (Concise Binary Object Representation) and JSON (JavaScript Object Notation) formats with this online web decoder.',
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
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(jsonLd)
    }
  ]
})

</script>
