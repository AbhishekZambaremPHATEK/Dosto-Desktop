Basic replacement

```jsx
<MessageBodyHighlight
  text="This is before <<left>>Inside<<right>> This is after."
  i18n={util.i18n}
/>
```

With no replacement

```jsx
<MessageBodyHighlight
  text="All\nplain\ntext š„ http://somewhere.com"
  i18n={util.i18n}
/>
```

With two replacements

```jsx
<MessageBodyHighlight
  text="Begin <<left>>Inside #1<<right>> This is between the two <<left>>Inside #2<<right>> End."
  i18n={util.i18n}
/>
```

With emoji, newlines, and URLs

```jsx
<MessageBodyHighlight
  text="http://somewhere.com\n\nš„ Before -- <<left>>A š„ inside<<right>> -- After š„"
  i18n={util.i18n}
/>
```

No jumbomoji

```jsx
<MessageBodyHighlight text="š„" i18n={util.i18n} />
```
