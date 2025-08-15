import { ReactNode } from 'react';
import useSillyLoadingText from 'src/util/sillyLoading';
import { Button, Flex, Spinner, Text } from '@radix-ui/themes';
import { ExclamationTriangleIcon, PersonIcon, PlusIcon, ReloadIcon } from '@radix-ui/react-icons';

interface TableUIProps<T = unknown> {
  children: ReactNode;
  loading: boolean;
  error: string | null;

  handleRetry?: () => void;

  createNewText?: string;
  createNewHandler?: () => void;

  statusHeading?: string;
  statusMessage?: string;

  data: T[];
}

export function TableUI<T = unknown>({
  children,
  loading,
  error,
  handleRetry,
  createNewText = 'Add item',
  createNewHandler,
  statusHeading = '',
  statusMessage = '',
  data,
}: TableUIProps<T>) {
  const loadingText = useSillyLoadingText();

  if (loading) {
    return (
      <Flex direction="column" align="center" justify="center" height="calc(40vh)" gap="4">
        <Spinner size="2" />
        <Flex direction="column" align="center" gap="1">
          <Text as="p" weight="bold" size="2">
            Loading
          </Text>
          <Text as="p" color="gray" size="2">
            {loadingText}
          </Text>
        </Flex>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex direction="column" align="center" justify="center" height="calc(40vh)" gap="4">
        <ExclamationTriangleIcon width="18" height="18" />
        <Flex direction="column" align="center" gap="1">
          <Text as="p" weight="bold" size="2">
            {statusHeading || 'An error occurred'}
          </Text>
          <Text as="p" color="gray" size="2">
            {statusMessage || 'Please try again and contact support if the issue persists.'}
          </Text>
        </Flex>
        {handleRetry && (
          <Button onClick={handleRetry}>
            <Flex gap="2" align="center">
              <ReloadIcon />
              Retry
            </Flex>
          </Button>
        )}
      </Flex>
    );
  }

  if (!data.length) {
    return (
      <Flex direction="column" align="center" justify="center" height="calc(40vh)" gap="4">
        <PersonIcon width="18" height="18" />
        <Flex direction="column" align="center" gap="1">
          <Text as="p" weight="bold" size="2">
            {statusHeading || 'No items found'}
          </Text>
          <Text as="p" color="gray" size="2">
            {statusMessage || 'Add an item to get started.'}
          </Text>
        </Flex>
        {createNewHandler && (
          <Button onClick={createNewHandler}>
            <Flex gap="2" align="center">
              <PlusIcon />
              {createNewText}
            </Flex>
          </Button>
        )}
      </Flex>
    );
  }

  return <>{children}</>;
}
