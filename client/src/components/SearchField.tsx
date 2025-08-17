import { Box, Flex, Button, TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon, PlusIcon, Cross2Icon } from '@radix-ui/react-icons';
import { useState, useEffect, useCallback } from 'react';

interface SearchFieldProps {
  loading: boolean;
  searchValue: string;
  placeholder: string;
  createButtonText: string;
  onSearch: (query: string) => void;
  onCreateNew: () => void;
  onClearSearch: () => void;
  debounceMs?: number;
}

export function SearchField({
  loading,
  searchValue,
  placeholder,
  createButtonText,
  onSearch,
  onCreateNew,
  onClearSearch,
  debounceMs = 300,
}: SearchFieldProps) {
  const [inputValue, setInputValue] = useState(searchValue);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue !== searchValue) {
        onSearch(inputValue);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [inputValue, searchValue, onSearch, debounceMs]);

  useEffect(() => {
    setInputValue(searchValue);
  }, [searchValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        onSearch(inputValue);
      }
      if (e.key === 'Escape') {
        setInputValue('');
        onClearSearch();
      }
    },
    [inputValue, onSearch, onClearSearch]
  );

  const handleClear = useCallback(() => {
    setInputValue('');
    onClearSearch();
  }, [onClearSearch]);

  return (
    <Box mb="6" mt="4">
      <Flex gap="2">
        <TextField.Root
          placeholder={placeholder}
          style={{ flexGrow: 1 }}
          disabled={loading}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
          {inputValue && (
            <TextField.Slot>
              <Button size="1" variant="ghost" onClick={handleClear} style={{ cursor: 'pointer' }}>
                <Cross2Icon height="12" width="12" />
              </Button>
            </TextField.Slot>
          )}
        </TextField.Root>

        <Button onClick={onCreateNew} loading={loading} style={{ cursor: 'pointer' }}>
          <PlusIcon height="16" width="16" /> {createButtonText}
        </Button>
      </Flex>
    </Box>
  );
}
