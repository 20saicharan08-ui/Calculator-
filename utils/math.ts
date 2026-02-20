
export const solveFormula = (id: string, params: number[]): string => {
  try {
    switch (id) {
      // MATH
      case 'quad': {
        const [a, b, c] = params;
        const d = b * b - 4 * a * c;
        if (d < 0) return 'Complex Root';
        const r1 = (-b + Math.sqrt(d)) / (2 * a);
        const r2 = (-b - Math.sqrt(d)) / (2 * a);
        return `x1:${r1.toFixed(3)} x2:${r2.toFixed(3)}`;
      }
      case 'trig_sin': return (params[0] / params[1]).toFixed(4);
      case 'trig_cos': return (params[0] / params[1]).toFixed(4);
      case 'trig_tan': return (params[0] / params[1]).toFixed(4);
      case 'log': return (Math.log(params[0]) / Math.log(params[1])).toFixed(4);
      case 'dist': return Math.sqrt(Math.pow(params[2] - params[0], 2) + Math.pow(params[3] - params[1], 2)).toFixed(3);
      case 'slope': return ((params[0] - params[1]) / (params[2] - params[3])).toFixed(3);
      case 'hcf': {
        let [a, b] = [Math.abs(params[0]), Math.abs(params[1])];
        while (b) { a %= b; [a, b] = [b, a]; }
        return a.toString();
      }
      case 'lcm': {
        const hcf = (a: number, b: number): number => {
          while (b) { a %= b; [a, b] = [b, a]; }
          return a;
        };
        const [a, b] = params;
        return ((a * b) / hcf(a, b)).toString();
      }
      case 'arith_sum': return ((params[1] / 2) * (2 * params[0] + (params[1] - 1) * params[2])).toFixed(2);

      // PHYSICS
      case 'force': return (params[0] * params[1]).toFixed(2) + ' N';
      case 'ohm': return (params[0] * params[1]).toFixed(2) + ' V';
      case 'kin1': return (params[0] + params[1] * params[2]).toFixed(2) + ' m/s';
      case 'work': return (params[0] * params[1]).toFixed(2) + ' J';
      case 'power': return (params[0] / params[1]).toFixed(2) + ' W';
      case 'grav': return (params[0] * 9.8).toFixed(2) + ' N';
      case 'energy_k': return (0.5 * params[0] * Math.pow(params[1], 2)).toFixed(2) + ' J';
      case 'energy_p': return (params[0] * 9.8 * params[1]).toFixed(2) + ' J';

      // CHEMISTRY
      case 'molar': return (params[0] / params[1]).toFixed(4) + ' M';
      case 'gas_p': return ((params[0] * 0.0821 * params[1]) / params[2]).toFixed(3) + ' atm';
      case 'mass': return (params[0] / params[1]).toFixed(3) + ' g/mL';
      case 'ph': return (-Math.log10(params[0])).toFixed(2);
      case 'dilution': return ((params[0] * params[1]) / params[2]).toFixed(3);

      // FINANCE
      case 'si': return ((params[0] * params[1] * params[2]) / 100).toFixed(2);
      case 'ci': return (params[0] * Math.pow(1 + (params[1] / 100) / params[3], params[3] * params[2])).toFixed(2);
      case 'emi': {
        const [P, r, N] = params;
        const monthlyRate = (r / 100) / 12;
        const emi = (P * monthlyRate * Math.pow(1 + monthlyRate, N)) / (Math.pow(1 + monthlyRate, N) - 1);
        return emi.toFixed(2);
      }
      case 'tax': return (params[0] * (params[1] / 100)).toFixed(2);
      case 'margin': return (((params[1] - params[0]) / params[1]) * 100).toFixed(2) + '%';

      // CONVERSION
      case 'c2f': return (params[0] * 1.8 + 32).toFixed(1) + ' °F';
      case 'f2c': return ((params[0] - 32) / 1.8).toFixed(1) + ' °C';
      case 'km2m': return (params[0] * 0.621371).toFixed(3) + ' mi';
      case 'kg2lb': return (params[0] * 2.20462).toFixed(3) + ' lb';
      case 'm2f': return (params[0] * 3.28084).toFixed(3) + ' ft';

      default: return 'Error';
    }
  } catch (e) {
    return 'Error';
  }
};
