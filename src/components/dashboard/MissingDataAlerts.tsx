import { useMissingDataAlerts } from '@/hooks/useMissingDataAlerts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MissingDataAlerts() {
  const { alerts, loading } = useMissingDataAlerts();
  const navigate = useNavigate();

  if (loading || alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert, index) => (
        <Alert 
          key={index} 
          variant={alert.type === 'warning' ? 'destructive' : 'default'}
          className="flex items-start justify-between"
        >
          <div className="flex gap-3">
            {alert.type === 'warning' ? (
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            ) : (
              <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <AlertTitle className="text-sm font-semibold">{alert.title}</AlertTitle>
              <AlertDescription className="text-sm mt-1">
                {alert.description}
              </AlertDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="ml-4 flex-shrink-0"
            onClick={() => navigate(alert.route)}
          >
            {alert.action}
          </Button>
        </Alert>
      ))}
    </div>
  );
}
