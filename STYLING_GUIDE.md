# Labrise Car Wash - Styling Guide

## Current Styling Architecture

### **Approach: Tailwind-First with Minimal Custom CSS**

The project now uses a **Tailwind-first approach** with minimal custom CSS for components that require complex styling.

## File Structure

```
src/styles/
├── index.css          # Tailwind imports + component classes
└── App.css           # Minimal custom styles only
```

## Design System

### **Colors**
```css
Primary: #667eea (Blue gradient)
Secondary: #764ba2 (Purple)
Success: #22c55e (Green)
Warning: #f59e0b (Orange)  
Danger: #ef4444 (Red)
```

### **Typography**
- Font: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto')
- Headings: `text-xl font-semibold text-gray-800`
- Body: `text-sm text-gray-600`
- Labels: `text-gray-700 font-medium`

### **Spacing**
- Container padding: `p-4 md:p-8`
- Card padding: `p-6`
- Form spacing: `mb-4` (form groups), `gap-4` (form rows)
- Button padding: `px-4 py-2`

## Component Classes

### **Buttons**
```css
.btn-primary    # Blue primary button
.btn-secondary  # Gray secondary button  
.btn-success    # Green success button
.btn-danger     # Red danger button
```

### **Forms**
```css
.form-group     # Form field container
.form-row       # Horizontal form layout
.modal-overlay  # Modal backdrop
.modal          # Modal container
```

### **Layout**
```css
.scrollbar-hide # Hide scrollbars
```

## Best Practices

### **1. Use Tailwind Classes First**
```tsx
// ✅ Good
<button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg">
  Submit
</button>

// ❌ Avoid
<button className="custom-button">Submit</button>
```

### **2. Component Classes for Reusable Patterns**
```tsx
// ✅ Good - Use component classes for repeated patterns
<button className="btn-primary">Submit</button>
<button className="btn-secondary">Cancel</button>

// ❌ Avoid - Repeating long class strings
<button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
```

### **3. Responsive Design**
```tsx
// ✅ Good - Mobile-first responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  
// ✅ Good - Responsive padding
<div className="p-4 md:p-8">
```

### **4. Consistent Spacing**
```tsx
// ✅ Good - Consistent spacing scale
<div className="space-y-4">      // 1rem gaps
<div className="space-y-6">      // 1.5rem gaps  
<div className="space-y-8">      // 2rem gaps
```

## Migration Status

### **✅ Completed**
- [x] Tailwind configuration enhanced
- [x] Base styles consolidated in index.css
- [x] Component classes defined
- [x] CarForm and ServiceForm converted
- [x] Login page already using Tailwind

### **🔄 In Progress**
- [ ] Dashboard components (partially converted)
- [ ] Other form components
- [ ] Table styling standardization

### **📋 Remaining Tasks**
1. Convert remaining components to Tailwind
2. Remove unused CSS from App.css
3. Standardize table and card layouts
4. Add dark mode support (future)

## Performance Benefits

### **Before (Custom CSS)**
- Large CSS bundle (~50KB)
- Unused styles included
- Maintenance overhead

### **After (Tailwind-First)**
- Smaller CSS bundle (~15KB purged)
- Only used styles included
- Consistent design system
- Faster development

## Development Workflow

### **Adding New Components**
1. Use Tailwind utility classes first
2. Create component classes for repeated patterns
3. Add custom CSS only when necessary
4. Test responsive behavior

### **Styling Guidelines**
- Mobile-first responsive design
- Use semantic color names (primary, success, danger)
- Maintain consistent spacing scale
- Follow accessibility best practices

## Common Patterns

### **Card Layout**
```tsx
<div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
  <h3 className="text-lg font-semibold text-gray-800 mb-4">Title</h3>
  <p className="text-gray-600">Content</p>
</div>
```

### **Form Layout**
```tsx
<div className="form-group">
  <label>Field Label</label>
  <input type="text" className="..." />
</div>
```

### **Modal Layout**
```tsx
<div className="modal-overlay">
  <div className="modal">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">Title</h2>
    {/* Content */}
    <div className="modal-actions">
      <button className="btn-secondary">Cancel</button>
      <button className="btn-primary">Submit</button>
    </div>
  </div>
</div>
```

## Troubleshooting

### **Styles Not Applying**
1. Check Tailwind content paths in config
2. Ensure classes are not purged
3. Verify import order in index.css

### **Custom CSS Conflicts**
1. Use `@layer components` for custom classes
2. Avoid `!important` declarations
3. Use Tailwind's specificity system

## Future Enhancements

1. **Dark Mode Support**
   - Add dark mode variants
   - Toggle component
   - System preference detection

2. **Animation Library**
   - Micro-interactions
   - Page transitions
   - Loading states

3. **Component Library**
   - Reusable UI components
   - Storybook documentation
   - Design tokens