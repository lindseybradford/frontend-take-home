import { useState, useEffect } from 'react';

const useSillyLoadingText = () => {
  const loadingPhrases = [
    'Warming up the hamsters...',
    'Convincing electrons to cooperate...',
    'Feeding the coding monkeys...',
    'Untangling the internet cables...',
    'Bribing the servers with cookies...',
    'Teaching robots to dance...',
    'Summoning the digital spirits...',
    'Polishing the pixels...',
    'Charging the flux capacitor...',
    'Herding cats in cyberspace...',
    'Calibrating the chaos engine...',
    'Asking the magic 8-ball nicely...',
    'Defragmenting the universe...',
    'Consulting the rubber duck...',
    'Spinning up the thinking wheels...',
    'Loading the loading loader...',
  ];

  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase(prev => (prev + 1) % loadingPhrases.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [loadingPhrases.length]);

  return loadingPhrases[currentPhrase];
};

export default useSillyLoadingText;
