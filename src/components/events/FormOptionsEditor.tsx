'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, X, ListFilter, ChevronDown, ChevronUp } from 'lucide-react';

interface FieldOptionsEditorProps {
  options: string[];
  onOptionsChange: (options: string[]) => void;
}

export function FormOptionsEditor({
  options = [],
  onOptionsChange: onChange,
}: Readonly<FieldOptionsEditorProps>) {
  const [newOption, setNewOption] = useState('');

  const handleOptionAdd = () => {
    const option = newOption.trim();
    if (!option) return;

    onChange([...options, option]);
    setNewOption('');
  };

  const handleOptionMove = (index: number, dir: 'up' | 'down') => {
    const newIndex = index + (dir === 'down' ? 1 : -1);
    if (newIndex < 0 || newIndex >= options.length) return;

    onChange(options.map((option, i) => {
      if (i === index) {
        return options[newIndex];
      } else if (i === newIndex) {
        return options[index];
      } else {
        return option;
      }
    }));
  }

  const handleOptionRemove = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <ListFilter className="h-3.5 w-3.5" />
          {options.length > 0 ? `${options.length} options` : 'Add options'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-3">
        <div className="space-y-1">
          <h4 className="font-medium text-xs leading-none">Field Options</h4>
          <p className="text-xs text-muted-foreground">
            Add options for select, radio, or checkbox.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Input
            placeholder="New option..."
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleOptionAdd();
              }
            }}
            className="h-8 text-xs"
          />
          <Button
            type="button"
            size="sm"
            className="h-8 w-8 px-0 shrink-0"
            onClick={handleOptionAdd}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
          {options.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              No options added yet.
            </p>
          ) : (
            options.map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-muted/50 px-2 py-1 rounded text-xs border border-border/50"
              >
 <span className="truncate max-w-[170px]" title={option}>
                  {(index + 1).toString() + ". " + option}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  <div className="h-5 w-5 inline-flex flex-col rounded-md bg-transparent overflow-hidden">
                    <Button
                      onClick={() => handleOptionMove(index, "up")}
                      disabled={index === 0}
                      variant="ghost"
                      size="sm"
                      className="flex h-1/2 w-full items-center justify-center rounded-none"
                    >
                      <ChevronUp className="h-2 w-2" />
                    </Button>
                    <Button
                      onClick={() => handleOptionMove(index, "down")}
                      disabled={index === options.length - 1}
                      variant="ghost"
                      size="sm"
                      className="flex h-1/2 w-full items-center justify-center rounded-none"
                    >
                      <ChevronDown className="h-2 w-2" />
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleOptionRemove(index)}
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
