import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DarkModeTestComponent() {
  return (
    <div className="p-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Dark Mode Test</h1>
        <p className="text-lg text-muted-foreground">
          Testing color consistency across light and dark themes
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card with different backgrounds */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Card Title</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This is muted text that should be readable in both themes.
            </p>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-foreground">Text on muted background</p>
            </div>
          </CardContent>
        </Card>

        {/* Form elements */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Form Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-input" className="text-foreground">
                Test Input
              </Label>
              <Input
                id="test-input"
                placeholder="Enter text here..."
                className="bg-background border-border text-foreground"
              />
            </div>
            <Button className="w-full">Primary Button</Button>
            <Button variant="outline" className="w-full">
              Outline Button
            </Button>
          </CardContent>
        </Card>

        {/* Status indicators */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Status Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-green-600 dark:text-green-400">✅ Success message</p>
              <p className="text-red-600 dark:text-red-400">❌ Error message</p>
              <p className="text-yellow-600 dark:text-yellow-400">⚠️ Warning message</p>
              <p className="text-primary">🔗 Primary link</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Background variations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Background Variations</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-background p-4 rounded-lg border border-border">
            <p className="text-foreground">bg-background</p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-card-foreground">bg-card</p>
          </div>
          <div className="bg-muted p-4 rounded-lg border border-border">
            <p className="text-muted-foreground">bg-muted</p>
          </div>
          <div className="bg-accent p-4 rounded-lg border border-border">
            <p className="text-accent-foreground">bg-accent</p>
          </div>
        </div>
      </div>

      {/* Glass effect test */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Glass Effects</h2>
        <div className="relative p-8 bg-gradient-radial">
          <div className="glass-effect p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Glass Effect Card
            </h3>
            <p className="text-muted-foreground">
              This card should have a glass effect with proper backdrop blur
              and transparency that works in both light and dark modes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
