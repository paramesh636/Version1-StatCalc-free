




function sum(x){
	let sum = 0;
	for(let i=0;i < x.length;i++){
		sum += parseFloat(x[i]);
	}
	return sum;
}

function mean(x){
	let s = sum(x);
	return Math.round((s/x.length)*100000)/100000;
}

function median(x){

	let med;
	let n = x.length;
	x.sort((a,b) => a - b);

	if (n%2 == 0){
		let i = Math.trunc(n/2);
		med = (x[i - 1] + x[i])/2;
	}else{
		let i = Math.floor(n/2);
		med = x[i];
	}

	return med;

}

function multiply(x,y){

	let result = [];
	for(let i = 0;i<x.length;i++){
		result.push(x[i]*y[i]);
	}

	return result;
}

function factorial(x){

	let ans = 1;
	while(x >= 1){

		ans = ans * x;
		x--;
	}
	return ans;
}

function central_tendency(x){

	let m = mean(x);
	let n = x.length;
	let mode;
	let result = [];
	result.push(m);

	let med = median(x);
	result.push(med);

    const freq = {};
    let maxFreq = 0;

    for (let i = 0; i < x.length; i++){
        const val = x[i];
        freq[val] = (freq[val] || 0) + 1;

        if (freq[val] > maxFreq) {
            maxFreq = freq[val];
        }
    }

    if (maxFreq === 1) {
        mode = "No Modes";
    }

    const modes = [];
    for (let key in freq) {
        if (freq[key] === maxFreq) {
            
            modes.push(isNaN(key) ? key : Number(key));
        }
    }

    if (modes.length === 1 || modes.length === 2 || modes.length === 3) {
        mode = modes;
    }else{
    	mode = "Multiple Modes";
    }

    result.push(mode);

    return result;

}


function variance(x){

	let mean_x = mean(x);
	let dev = [];
	for(let i = 0;i < x.length; i++){
		let s = Math.round(Math.pow(x[i] -  mean_x,2)*10000)/10000;
		dev.push(s);
	}
	let v = sum(dev)/x.length;
	return [Math.round(v*10000)/10000,dev];

}

function standard_dev(x){

	let values = variance(x);
	let var_x = values[0];
	let sd = Math.round(Math.sqrt(var_x)*10000)/10000;
	return sd
}


function correlation_coeff(x,y){
	let n = x.length;
	let sum_x = sum(x);
	let sum_y = sum(y);
	let x2 = multiply(x,x);
	let y2 = multiply(y,y);
	let xy = multiply(x,y);
	let sum_x2 = sum(x2);
	let sum_y2 = sum(y2);
	let sum_xy = sum(xy);

	let r = ((n * sum_xy) - (sum_x * sum_y))/Math.sqrt(((n*sum_x2)-(sum_x*sum_x))*((n*sum_y2)-(sum_y*sum_y)));
	
	r = Math.round(r*100000)/100000;

	return [r,sum_x,sum_y,sum_x2,sum_y2,sum_xy,n,x2,y2,xy]

}

function curve_fit_linear(xArray,yArray){

	let n = xArray.length;
	let sum_x = sum(xArray);
	let sum_y = sum(yArray);
	let x2 = multiply(xArray,xArray);
	let xy = multiply(xArray,yArray);
	let sum_x2 = sum(x2);
	let sum_xy = sum(xy);
	let eqn1 = [[n,sum_x],[sum_x,sum_x2]];
	let constants = [sum_y,sum_xy];
	let solution = math.lusolve(eqn1,constants);
	return [solution,n,sum_x,sum_y,sum_x2,sum_xy,x2,xy];
}

function curve_fit_quadratic(xArray,yArray){
	let n = xArray.length;
	let sum_x = sum(xArray);
	let sum_y = sum(yArray);
	let x2 = multiply(xArray,xArray);
	let x3 = multiply(x2,xArray);
	let x4 = multiply(x3,xArray);
	let xy = multiply(xArray,yArray);
	let x2y = multiply(x2,yArray);
	let sum_x2 = sum(x2);
	let sum_x3 = sum(x3);
	let sum_x4 = sum(x4);
	let sum_xy = sum(xy);
	let sum_x2y = sum(x2y);
	let eqn = [[sum_x2,sum_x,n],[sum_x3,sum_x2,sum_x],[sum_x4,sum_x3,sum_x2]];
	let constants = [sum_y,sum_xy,sum_x2y];
	let solution = math.lusolve(eqn,constants);
	return [solution,n,sum_x,sum_y,sum_x2,sum_x3,sum_x4,sum_xy,sum_x2y,x2,x3,x4,xy,x2y];
}

function quartile(x){

	let n = x.length;
	let q2 = median(x);
	let q1;
	let q3;
	let iqr;

	let i = (n + 1)/4;
	let j = (n +1)*(3/4);

	if(i%1 != 0 || j%1 != 0){
		
		let rem_i = i%1;
		let rem_j = j%1;
		let curr_i = (i - rem_i) - 1;
		let curr_j = (j - rem_j) - 1;
		
		q1 = x[curr_i] + (rem_i * (x[curr_i + 1] - x[curr_i]));
		q3 = x[curr_j] + (rem_j * (x[curr_j + 1] - x[curr_j]));
		iqr = q3 - q1;
		return [q1,q2,q3,iqr];

	}

	q1 = x[i - 1];
	q3 = x[j - 1];
	iqr = q3 - q1;
	return [q1,q2,q3,iqr];
}

function z_score(dataset,x){

	let mean_x = mean(dataset);
	let sd = standard_dev(dataset);
	let z = Math.round(((x - mean_x)/sd)*10000)/10000;
	return [z,mean_x,sd];
}

function normal_distribution(mean_x,sd){

	let result = [];
	let labels = [];
	for(let i = mean_x - 4*sd;i <= mean_x + 4*sd;i += 0.05){

		result.push(	
				(1/(sd * Math.sqrt(2 * Math.PI)))*(Math.exp(-(Math.pow((i - mean_x),2)/(2 * sd * sd))))
			);
		labels.push(i);
		
	}

	return {
		labels:labels,
		curve:result
	};

}

function binomial_dist(n,p,x){

	let ncx = (factorial(n))/(factorial(x)*factorial(n - x));

	return ncx*(Math.pow(p,x))*(Math.pow(1-p,n-x));
}

function collatz(x){

	let label = [];
	let result = [];
	let i = 1;
	while(x > 1){

		if(x%2 == 0){
			x /= 2;
		}else{
			x = 3*x + 1;
		}

		label.push(i);
		result.push(x);
		i++;
	}

	return [label,result];
}
