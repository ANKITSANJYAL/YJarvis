// Transcript Extractor - YouTube transcript extraction
export class TranscriptExtractor {
  constructor() {
    console.log('[TranscriptExtractor] Initialized');
  }

  async extract() {
    console.log('[TranscriptExtractor] Extracting transcript...');
    const startTime = performance.now();

    try {
      // Method 1: Try to open transcript panel and extract
      const transcript = await this.extractFromPanel();
      
      if (transcript && transcript.length > 0) {
        const duration = performance.now() - startTime;
        console.log(`[TranscriptExtractor] Extracted ${transcript.length} chars in ${duration.toFixed(0)}ms`);
        return transcript;
      }

      throw new Error('No transcript available for this video');
    } catch (error) {
      console.error('[TranscriptExtractor] Error:', error);
      throw error;
    }
  }

  async extractFromPanel() {
    // Click the "Show transcript" button if not already open
    const transcriptButton = await this.findTranscriptButton();
    
    if (transcriptButton) {
      transcriptButton.click();
      console.log('[TranscriptExtractor] Opened transcript panel');
      
      // Wait for panel to load
      await this.waitForTranscriptPanel();
    }

    // Extract text from transcript panel
    const transcriptText = this.extractTextFromPanel();
    return transcriptText;
  }

  async findTranscriptButton() {
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Look for transcript button in various selectors
    const selectors = [
      'button[aria-label*="transcript" i]',
      'button[aria-label*="Show transcript" i]',
      'yt-formatted-string:contains("Transcript")',
      '#description button[aria-label*="transcript" i]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (element.textContent.toLowerCase().includes('transcript') || 
            element.getAttribute('aria-label')?.toLowerCase().includes('transcript')) {
          return element;
        }
      }
    }

    // Check if panel is already open
    const panel = document.querySelector('ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-transcript"]');
    if (panel) {
      console.log('[TranscriptExtractor] Transcript panel already open');
      return null;
    }

    throw new Error('Transcript button not found');
  }

  async waitForTranscriptPanel() {
    const maxWait = 5000; // 5 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      const panel = document.querySelector('ytd-transcript-segment-renderer');
      if (panel) {
        // Wait a bit more for all segments to load
        await new Promise(resolve => setTimeout(resolve, 500));
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error('Transcript panel did not load');
  }

  extractTextFromPanel() {
    // Get all transcript segments
    const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
    
    if (segments.length === 0) {
      throw new Error('No transcript segments found');
    }

    // Extract text from each segment
    const transcriptParts = [];
    segments.forEach(segment => {
      const textElement = segment.querySelector('yt-formatted-string.segment-text');
      if (textElement) {
        transcriptParts.push(textElement.textContent.trim());
      }
    });

    // Join all parts
    const fullTranscript = transcriptParts.join(' ');
    
    if (fullTranscript.length === 0) {
      throw new Error('Transcript is empty');
    }

    return fullTranscript;
  }

  // Helper: Close transcript panel
  closePanel() {
    const closeButton = document.querySelector('ytd-engagement-panel-title-header-renderer button[aria-label*="Close" i]');
    if (closeButton) {
      closeButton.click();
      console.log('[TranscriptExtractor] Closed transcript panel');
    }
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TranscriptExtractor };
}
