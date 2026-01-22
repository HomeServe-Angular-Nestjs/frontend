import { Pipe, PipeTransform } from '@angular/core';

type MetricKey = 'avgResponseTime' | 'completionRate' | 'onTimePercent' | 'avgRating';

interface Badge {
    label: string;
    classes: string;
}

@Pipe({ name: 'metricPerformanceBadge' })
export class MetricPerformanceBadgePipe implements PipeTransform {

    transform(value: number, key: MetricKey): Badge {
        if (value == null || isNaN(value)) {
            return { label: 'Invalid', classes: 'bg-gray-100 text-gray-700' };
        }

        let label: string;
        let classes: string;

        switch (key) {
            case 'avgResponseTime': // minutes
                if (value <= 20) { label = 'Excellent'; classes = 'bg-green-100 text-green-700'; }
                else if (value <= 60) { label = 'Great'; classes = 'bg-blue-100 text-blue-700'; }
                else if (value <= 180) { label = 'Good'; classes = 'bg-yellow-100 text-yellow-700'; }
                else { label = 'Needs Work'; classes = 'bg-red-100 text-red-700'; }
                break;

            case 'completionRate':
            case 'onTimePercent': // percentage
                if (value >= 90) { label = 'Excellent'; classes = 'bg-green-100 text-green-700'; }
                else if (value >= 75) { label = 'Great'; classes = 'bg-blue-100 text-blue-700'; }
                else if (value >= 50) { label = 'Good'; classes = 'bg-yellow-100 text-yellow-700'; }
                else { label = 'Needs Work'; classes = 'bg-red-100 text-red-700'; }
                break;

            case 'avgRating': // rating out of 5
                if (value >= 4.5) { label = 'Excellent'; classes = 'bg-green-100 text-green-700'; }
                else if (value >= 4) { label = 'Great'; classes = 'bg-blue-100 text-blue-700'; }
                else if (value >= 3) { label = 'Good'; classes = 'bg-yellow-100 text-yellow-700'; }
                else { label = 'Needs Work'; classes = 'bg-red-100 text-red-700'; }
                break;

            default:
                label = 'Unknown';
                classes = 'bg-gray-100 text-gray-700';
        }

        return { label, classes };
    }
}
