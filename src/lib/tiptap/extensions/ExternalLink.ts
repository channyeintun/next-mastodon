import Link from '@tiptap/extension-link';

export const ExternalLink = Link.configure({
  openOnClick: true,
  HTMLAttributes: {
    target: '_blank',
    rel: 'noopener noreferrer',
    class: 'external-link',
    style: 'color: var(--link); text-decoration: underline;',
  },
});
