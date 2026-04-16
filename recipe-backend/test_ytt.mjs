import { YoutubeTranscript } from 'youtube-transcript';
YoutubeTranscript.fetchTranscript('https://www.youtube.com/watch?v=sMvTFgDeasM').then(d => console.log('success', d.length)).catch(console.error);
