const Contract = require("../model/Contract");
const ApiFeatures = require("../utils/apifeatures");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const AppError = require('../utils/appError')
const User=  require("../model/userModel");

const getAllContracts = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 8;
  const contractCount = await Contract.countDocuments();

  const apiFeature = new ApiFeatures(Contract.find(), req.query)
    .search()
    .filter();

  let contract = await apiFeature.query;

  let filteredContractCount = contract.length;

  // apiFeature.pagination(resultPerPage);

  contract = await apiFeature.query;

  res.status(200).json(
   contract
  );
});

const getById = async (req, res, next) => {
  const id = req.params.id;
  let contract;
  try {
    contract = await Contract.findById(id);
  } catch (err) {
    console.log(err);
  }
  if (!contract) {
    return res.status(404).json({ message: "No Contract found" });
  }
  return res.status(200).json({ contract });
};

const addContract = async (req, res, next) => {
  const { duration, type, status } = req.body;
  let contract;
  const user = await User.findById(req.params.userId)
  try {
    contract = new Contract({
      user:user,
      duration,
      type,
      status,
      
    });
    await contract.save();
  } catch (err) {
    console.log(err);
  }

  if (!contract) {
    return res.status(500).json({ message: "Unable To Add" });
  }
  return res.status(201).json({ contract });
};


// const ChangeStatus = catchAsyncErrors(async (req,res,next) =>{
//   if(req.params.status == "Shipped" || req.params.status == "Terminated"  || req.params.status == "Cancelled"){
//      const NewStatus = {status : req.params.status}

//      const ContractAll = await Contract.findById(req.params.ContractId)

//      Object.assign(ContractAll,NewStatus)
//      console.log(ContractAll);

//       const newOrder = await ContractAll.save()

//      res.status(200).json(ContractAll)
//    }else{
//      next(new AppError('chose valide status' , 400))
//  }
// })
 
  


const deleteContract = async (req, res, next) => {
  const id = req.params.id;
  let contract;
  try {
    contract = await Contract.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
  }
  if (!contract) {
    return res.status(404).json({ message: "Unable To Delete By this ID" });
  }
  return res.status(200).json({ message: "Product Successfully Deleted" });
};


const updateContract = catchAsyncErrors(async (req, res, next) => {

   
    const contract = await Contract.findById(req.params.id);
  
    if (!contract) {
      return next(new ErrorHander("Order not found with this Id", 404));
    }
    
    contract.contractstatus = req.body.status;
  
    if (req.body.status === "Cancelled") {
      contract.terminateAt = Date.now();
    }
    if (req.body.status === "Terminated") {
      contract.terminateAt = Date.now();
    }
  
    await contract.save({ validateBeforeSave: false });
    res.status(200).json({
      success: "your status is updated",
    });
  });

exports.getAllContracts = getAllContracts;
exports.addContract = addContract;
exports.getById = getById;
exports.updateContract = updateContract;
exports.deleteContract = deleteContract;
// exports.ChangeStatus=ChangeStatus;
