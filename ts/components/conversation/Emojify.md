### All emoji

```jsx
<Emojify text="π₯π₯π₯" />
```

### With skin color modifier

```jsx
<Emojify text="ππΎ" />
```

### With `sizeClass` provided

```jsx
<Emojify text="π₯" sizeClass="jumbo" />
```

```jsx
<Emojify text="π₯" sizeClass="large" />
```

```jsx
<Emojify text="π₯" sizeClass="medium" />
```

```jsx
<Emojify text="π₯" sizeClass="small" />
```

```jsx
<Emojify text="π₯" sizeClass="" />
```

### Starting and ending with emoji

```jsx
<Emojify text="π₯in betweenπ₯" />
```

### With emoji in the middle

```jsx
<Emojify text="Before π₯π₯ after" />
```

### No emoji

```jsx
<Emojify text="This is the text" />
```

### Providing custom non-link render function

```jsx
const renderNonEmoji = ({ text, key }) => (
  <span key={key}>This is my custom content</span>
);
<Emojify text="Before π₯π₯ after" renderNonEmoji={renderNonEmoji} />;
```
