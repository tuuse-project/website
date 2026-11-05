import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: {
        include: '**/*.md',
        exclude: ['events/**', 'pages/**'],
      },
    }),
pages: defineCollection({
      type: 'data',
      source: 'pages/home.json',

    }),
    events: defineCollection({
      type: 'data',
      source: 'events/*.json',

      schema: z.object({
        title: z.string(),
        slug: z.string(),

        description: z.string(),
        date: z.string(),
        time: z.string(),

        location: z.object({
          name: z.string(),
          address: z.string(),
        }),

        cover: z.string(),

        ticketUrl: z.string().optional(),

        status: z.enum([
          'draft',
          'published',
          'archived',
        ]),

        lineup: z.array(
          z.object({
            name: z.string(),
            image: z.string().optional(),
          })
        ).default([]),

        seo: z.object({
          title: z.string(),
          description: z.string(),
          image: z.string(),
        }),
      }),
    }),
  },
})