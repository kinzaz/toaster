https://github.com/kinzaz/toaster

## Usage

To start using the library, install it in your project:

```bash
npm install k-toaster
```

Add `<Toaster />` to your app, it will be the place where all your toasts will be rendered.
After that you can use `toast()` from anywhere in your app.

```jsx
import { Toaster, toast } from "k-toaster";

// ...

function App() {
  return (
    <div>
      <Toaster />
      <button onClick={() => toast("My first toast")}>Give me a toast</button>
    </div>
  );
}
```
