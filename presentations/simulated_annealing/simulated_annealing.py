
# Adapted from the implimentation found here:
# http://katrinaeg.com/simulated-annealing.html


import sys
import numpy
import scipy.stats
import random
import matplotlib.pyplot as pyplot


 
def acceptance_probability(old_utility, new_utility, T):
    ap = numpy.exp((new_utility-old_utility)/T)
    return ap



def neighbor(solution, resolution, max_step=10):
    start = max(solution - max_step, 0)
    end   = min(solution + max_step, resolution-1)
    neighbors = range(start, end)
    try:
        neighbors.remove(solution)
    except:
        pass
    return random.choice(neighbors)


    

def norm_mix_neg_LL(X, minX, maxX, n_norm=10):
    PI = numpy.array([1/10.0]*10)
    MU = numpy.array([15, 3, 20, 40, 10, 2, 75, 30, 35, 86])
    STD =numpy.array([0.80, 0.60, 0.20, 0.40, 0.10, 2, 0.10, 0.30, 0.35, 0.80])*10

    nX = len(X)
    nK = len(MU)
    P = numpy.zeros((nX, nK))
    for k in range(nK):
        P[:,k] = scipy.stats.norm.pdf(X, MU[k], STD[k]) * PI[k]


    Psum = numpy.sum(P,1)
    return Psum

def simulated_annealing(start_state, iterations, resolution, X, utility, alpha,  T=1.0, T_min=0.00001, verbose=False):
    solution = start_state
    old_utility = utility[start_state]
    best_solution = start_state
    best_utility = old_utility
    print "#Starting state: Y[%d] = %f" % (best_solution, best_utility)
    count = 0
    if verbose:
        pyplot.plot(X, utility, "-b")
        pyplot.plot(X[start_state], old_utility, "or")
        pyplot.title("%d" % count)
        pyplot.savefig("simulated_annealing_0.png", bbox_inches="tight")
        yplot.close()
    
    # Continue looping if we haven't reached minimum temperature
    while T > T_min:
        i = 1
        # For a given temperature, look for new neighbors for these iterations
        while i <= iterations:
            new_solution = neighbor(solution, resolution)
            new_utility = utility[new_solution]

            #Keep track of best solution so far
            if new_utility > best_utility:
                best_utility = new_utility
                best_solution = new_solution
                print "#New best state: Y[%d] = %f" % (best_solution, best_utility)

            #Calculate acceptance probability based on Temp and utility
            ap = acceptance_probability(old_utility, new_utility, T)
            if ap > random.random():
                solution = new_solution
                old_utility = new_utility

            # Code for saving images
            if count < 150 and i % 10 == 0 and verbose:
                count+=1
                pyplot.plot(X, utility, "-b")
                pyplot.plot(X[solution], old_utility, "or")
                pyplot.plot(X[best_solution], best_utility, "og")
                pyplot.title("%d" % count)
                pyplot.savefig("simulated_annealing_%d.png" % count, bbox_inches="tight")
                pyplot.close()
                
            i += 1
        # Reduce temperature
        T = T*alpha
    return best_solution, best_utility


def main(*args, **kwargs):
    # Get arguments
    iterations = int(kwargs.get("iterations", 1000))    
    resolution = int(kwargs.get("resolution", 500))     # "Discreteness" of normal mixture
    alpha = float(kwargs.get("alpha", 0.9))             # How quickly we change temperature
    start_state = int(kwargs.get("start", 300))         # Start state/index
    utility_func = kwargs.get("start", norm_mix_neg_LL) 

    minX =  0
    maxX =  100
    
    # If start state/index not defined, choose randomly
    if start_state == -1:
        start_state = random.randint(0, resolution-1)
        print "#Random start state: %d" % start_state

    # Hard coded data, X, and utility, Y, and states = 1:Length(X)
    X = numpy.linspace(minX, maxX, resolution)
    Y = utility_func(X, minX, maxX, n_norm = 10)

    
    best_state, best_utility = simulated_annealing(start_state, iterations, resolution, X, Y, alpha)

    # print all data and utility, with best solution on top for easy plotting.
    print "# Best state:  X[%d] = %f " % (best_state, X[best_state])
    print "# Best utility:   Y[%d] = %f " % (best_state, Y[best_state])
    print X[best_state], Y[best_state]
    for x,y in zip(X,Y):
        print x,y


if __name__ == "__main__":
    main()


