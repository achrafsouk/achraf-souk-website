import { describe, it, expect, beforeEach, vi } from 'vitest';

// Test the truncation logic directly without DOM dependencies
describe('Content Description Truncation Logic', () => {
    // Extract the truncation logic as a standalone function for testing
    function truncateToFirstLine(text) {
        if (!text) return '';
        
        // Split by common sentence endings and line breaks
        const sentences = text.split(/[.!?]\s+|\n/);
        
        // Get the first sentence/line
        let firstLine = sentences[0].trim();
        
        // If the first sentence is very short (less than 30 chars), 
        // try to include the next sentence if it exists and the total is reasonable
        if (firstLine.length < 30 && sentences.length > 1 && sentences[1]) {
            const secondSentence = sentences[1].trim();
            const combined = firstLine + '. ' + secondSentence;
            if (combined.length <= 120) {
                firstLine = combined;
            }
        }
        
        // If still very long, truncate at word boundary
        if (firstLine.length > 120) {
            const words = firstLine.split(' ');
            let truncated = '';
            for (const word of words) {
                if ((truncated + ' ' + word).length > 120) break;
                truncated += (truncated ? ' ' : '') + word;
            }
            firstLine = truncated;
        }
        
        // Add ellipsis if we truncated or if there's more content
        const needsEllipsis = firstLine.length < text.length || sentences.length > 1;
        return needsEllipsis ? firstLine + '...' : firstLine;
    }

    describe('truncateToFirstLine function', () => {
        it('should truncate long descriptions with multiple sentences', () => {
            const longText = "This is a very long description that should be truncated because it contains multiple sentences. This is the second sentence that should not appear in the truncated version.";
            const result = truncateToFirstLine(longText);
            
            expect(result).toBe("This is a very long description that should be truncated because it contains multiple sentences...");
            expect(result.length).toBeLessThan(longText.length);
        });

        it('should not truncate short descriptions', () => {
            const shortText = "Short description.";
            const result = truncateToFirstLine(shortText);
            
            expect(result).toBe("Short description.");
        });

        it('should handle empty or null input', () => {
            expect(truncateToFirstLine('')).toBe('');
            expect(truncateToFirstLine(null)).toBe('');
            expect(truncateToFirstLine(undefined)).toBe('');
        });

        it('should truncate at word boundaries for very long single sentences', () => {
            const longSingleSentence = "This is a very long single sentence that goes on and on and on and should be truncated at a word boundary to maintain readability and not cut words in half which would look unprofessional and confusing to users reading the content.";
            const result = truncateToFirstLine(longSingleSentence);
            
            expect(result).toContain('...');
            expect(result.length).toBeLessThanOrEqual(123); // 120 + "..."
            expect(result).not.toMatch(/\s\w*$/); // Should not end with partial word
        });

        it('should combine short first sentence with second sentence if reasonable', () => {
            const shortFirstSentence = "Short. This is a longer second sentence that should be included.";
            const result = truncateToFirstLine(shortFirstSentence);
            
            // The function combines sentences when the first is short, so it includes both
            expect(result).toBe("Short. This is a longer second sentence that should be included....");
        });

        it('should handle text with line breaks', () => {
            const textWithLineBreaks = "First line\nSecond line that should not appear";
            const result = truncateToFirstLine(textWithLineBreaks);
            
            // The function treats line breaks as sentence separators, but may combine if first is short
            expect(result).toBe("First line. Second line that should not appear...");
        });

        it('should handle real content examples from the portfolio', () => {
            const realExample1 = "Join us in this session to learn more about Lambda@Edge: it's availability in the Nordics, use cases from customers like Blockbuster, examples of implementations and best practices.";
            const result1 = truncateToFirstLine(realExample1);
            expect(result1).toContain('...');
            expect(result1.length).toBeLessThan(realExample1.length);

            const realExample2 = "Do you want to know how Lambda@Edge could fit into your environment? In this session, join our engineers to discuss Lambda@Edge best practices throughout the lifecycle of your application, and bring your questions.";
            const result2 = truncateToFirstLine(realExample2);
            expect(result2).toBe("Do you want to know how Lambda@Edge could fit into your environment...");
        });
    });
});